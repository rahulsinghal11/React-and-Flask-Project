import '../App.css'
import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { lighten, makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip'
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import AppBar from '@material-ui/core/AppBar';
import InputBase from '@material-ui/core/InputBase';
import { alpha} from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import exportFromJSON from 'export-from-json';

import SimpleRating from './rating';
import {token} from "./login";


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'id', numeric: true, disablePadding: false, label: 'Product ID', editable: true },
  { id: 'name', numeric: false, disablePadding: true, label: 'Product Name' },
  { id: 'image', numeric: false, disablePadding: false, label: 'Image' },
  { id: 'price', numeric: true, disablePadding: false, label: 'Price' },
  { id: 'category', numeric: false, disablePadding: false, label: 'Category' },
  { id: 'rating', numeric: true, disablePadding: false, label: 'Stock' },
  { id: 'rating', numeric: false, disablePadding: false, label: 'Rating' },
  { id: 'actions', disablePadding: false },
];

function EnhancedTableHead(props) {
  const { classes, onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort} = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ 'aria-label': 'select all desserts' }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'left' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                  {console.log(orderBy)}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

EnhancedTableHead.propTypes = {
  classes: PropTypes.object.isRequired,
  numSelected: PropTypes.number.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  onSelectAllClick: PropTypes.func.isRequired,
  order: PropTypes.oneOf(['asc', 'desc']).isRequired,
  orderBy: PropTypes.string.isRequired,
  rowCount: PropTypes.number.isRequired,
};

const useToolbarStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  title: {
    flex: '1 1 100%',
  },
}));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { numSelected, deleteSelectedProducts } = props;
  const [open, setOpen] = React.useState(false);

  const [name, setName] = React.useState('');
  const [image, setImage] = React.useState('');
  const [price, setPrice] = React.useState(null);
  const [category, setCategory] = React.useState('');
  const [rating, setRating] = React.useState(null);

  const handleClickOpen = () => {
    if(token && token!="" && token!=undefined){
        setOpen(true);
    } else {
        alert("Please Login to add Products");
    }

  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleAddProduct = async () => {
    try {
      if(token && token!="" && token!=undefined){
        let result = await fetch("http://127.0.0.1:5000/product", 
          {
          method: 'POST',
          headers:{'Content-Type': 'application/json', "Authorization": 'Bearer ' + token},
          body: JSON.stringify({name: name, image: image, price: price, category: category, rating: rating})
          });
          if(result.msg){
              alert("Login information not correct! Try logging in again.");
          }
          else {
              window.location.reload();
          }
      }
      else{
          alert("Please Login to add Products");
      }
      setOpen(false);
    } catch(e){
      alert("Sorry, Something went wrong, please try again later!");
    }
    

  };

  return (
    <Toolbar
      className={clsx(classes.root, {
        [classes.highlight]: numSelected > 0,
      })}
    >
    <Tooltip title="Add Product">
      <IconButton aria-label="Add Product">
        <AddIcon onClick={handleClickOpen} />
      </IconButton>
    </Tooltip>   
    <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Add Product</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Product Name"
            type="text"
            fullWidth
            onChange={event => setName(event.target.value)}
            required
          />
          <TextField
            autoFocus
            margin="dense"
            id="image"
            label="Image URL"
            type="url"
            fullWidth
            onChange={event => setImage(event.target.value)}
            required
          />
          <TextField
            autoFocus
            margin="dense"
            id="price"
            label="Price"
            type="float"
            fullWidth
            onChange={event => setPrice(event.target.value)}
            required
          />
          <TextField
            autoFocus
            margin="dense"
            id="category"
            label="Category"
            type="text"
            fullWidth
            onChange={event => setCategory(event.target.value)}
            required
          />
          <TextField
            autoFocus
            margin="dense"
            id="stock"
            label="Stock"
            type="text"
            fullWidth
            required
          />
          <TextField
            autoFocus
            margin="dense"
            id="rating"
            label="Rating"
            type="float"
            fullWidth
            onChange={event => setRating(event.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleAddProduct} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
      {numSelected > 0 ? (
        <Typography className={classes.title} color="inherit" variant="subtitle1" component="div">
          {numSelected} selected
        </Typography>
      ) : (null)}

      {numSelected > 0 ? (
        <Tooltip title="Delete">
          <IconButton aria-label="delete">
            <DeleteIcon onClick={deleteSelectedProducts}/>
          </IconButton>
        </Tooltip>
      ) : null}
    </Toolbar>
  );
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  paper: {
    width: '100%',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
}));

export default function EnhancedTable() {
  const classes = useStyles();
  const [rows, setRows] = React.useState([]);
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('calories');
  const [selected, setSelected] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [dense, setDense] = React.useState(false);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [image, setImage] = React.useState('');
  const [price, setPrice] = React.useState(null);
  const [category, setCategory] = React.useState('');
  const [rating, setRating] = React.useState(null);
  const [selectedFile, setSelectedFile] = React.useState(null);

  const handleClickOpen = () => {
    if(token && token!="" && token!=undefined){
        setOpen(true);
    } else {
        alert("Please Login to update Products");
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async (id) => {
    try {
      if(token && token!="" && token!=undefined){
        let result = await fetch("http://127.0.0.1:5000/product/"+id, 
          {
              method: 'PUT',
              headers:{'Content-Type': 'application/json', "Authorization": 'Bearer ' + token},
              body: JSON.stringify({name: name, image: image, price: price, category: category, rating: rating})
          });
          if(result.msg){
              alert("Login information not correct! Try logging in again.");
          }
          else {
              setOpen(false);
              fetchData();
          }
      }
      else{
          alert("Please Login to Update Products");
      }
      setOpen(false);
    } catch(e){
      alert("Sorry, Something went wrong, please try again later!");
    }
      
  };

  const searchData = async (key) => {
    try {
      let result = await fetch("http://127.0.0.1:5000/search/"+key);
      result = await result.json();
      if(result.success === true) {
        setRows(result.response); 
      }else{
        alert("Error Occured!")
      }
    } catch(e){
      alert("Sorry, Something went wrong, please try again later!");
    }
       
    }
  
  const fetchData = async () => {
    try{
      let result = await fetch("http://127.0.0.1:5000/");
      result = await result.json();
      if(result.success === true) {
        setRows(result.response); 
      }else{
        alert("Error Occured!");
    }
    } catch(e){
      alert("Sorry, Something went wrong, please try again later!");
    }
       
  }
  
  const deleteProduct = async (id) => { 
    try {
      if(token && token!="" && token!=undefined){
        let result = await fetch("http://127.0.0.1:5000/product/"+id,
        {
            method: 'DELETE',
            headers:{'Content-Type': 'application/json', "Authorization": 'Bearer ' + token}
        });
        if(result.msg){
            alert("Login information not correct! Try logging in again.");
        } else {
            fetchData();
        }        
      } else {
        alert("Please Login to delete Products");
    }      
    } catch(e){
      alert("Sorry, Something went wrong, please try again later!");
    }
    
  }

  const deleteSelectedProducts = async () => {
    try {
      if(token && token!="" && token!=undefined){
        const resultArray = await Promise.all(selected.map(async (key) => {
          let result = await fetch("http://127.0.0.1:5000/search/"+ key);
          result = await result.json();
          deleteProduct(result.response[0].id);       
          }));  
        fetchData();      
      } else {
        alert("Please Login to delete Products");
      }
    } catch(e){
      alert("Sorry, Something went wrong, please try again later!");
    }
    
  }


  useEffect(() => {
    fetchData();
  }, []);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }
    setSelected(newSelected);
  };

  const useStyle = makeStyles((theme) => ({
    root: {
        flexGrow: 0.5,
    },
    menuButton: {
        marginRight: theme.spacing(1),
    },
    title: {
        flexGrow: 1,
        display: 'none',
        [theme.breakpoints.up('sm')]: {
            display: 'block',
        },
    },
    search: {
        position: 'relative',
        borderRadius: theme.shape.borderRadius,
        backgroundColor: alpha(theme.palette.common.white, 0.15),
        '&:hover': {
            backgroundColor: alpha(theme.palette.common.white, 0.25),
        },
        marginLeft: 0,
        width: '25ch',
        [theme.breakpoints.up('sm')]: {
            marginLeft: theme.spacing(0),
            width: '25ch',
        },
    },
    searchIcon: {
        padding: theme.spacing(0, 1),
        height: '100%',
        position: 'absolute',
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputRoot: {
        color: 'inherit',
        width: '25ch'
    },
    inputInput: {
        padding: theme.spacing(1, 1, 1, 0),
        // vertical padding + font size from searchIcon
        paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
        transition: theme.transitions.create('width'),
        width: '100%',
        [theme.breakpoints.up('sm')]: {
            width: '12ch',
            '&:focus': {
                width: '20ch',
            },
        },
    },
  }));

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleExport = () => {
    const worksheet = window.XLSX.utils.json_to_sheet(rows);
    const workbook = {
      Sheets: {
        'data': worksheet
      },
      SheetNames:['data']
    };
    const excelBuffer = window.XLSX.write(workbook, {bookType:'xlsx', type:'array'});
    saveAsExcel(excelBuffer, 'myFile');
  };

  function saveAsExcel(buffer, filename){
    const data = new Blob([buffer], {type: EXCEL_TYPE});
    window.saveAs(data, filename+'_export_'+new Date().getTime()+EXCEL_EXTENSION);
  }

  const handleImport = () => {
    if(selectedFile){
      let fileReader = new FileReader();
      fileReader.readAsBinaryString(selectedFile);
      fileReader.onload = (e) => {
        //let data = e.target.result;
        let workbook = window.XLSX.read(e.target.result, {type: "binary"});
        workbook.SheetNames.forEach(sheet => {
          let rowObject = window.XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
          setRows(rowObject);
        });
      } 
      setSelectedFile(null);
    }
  }
  


  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);
  const cl = useStyle();

  return (
    <>
      <div className={cl.root}>
            <AppBar position="static">
                <Toolbar>
                    <Typography className={cl.title} variant="h6" noWrap>
                        Manage Products
                    </Typography>
                    <div className={cl.search}>
                        <div className={cl.searchIcon}>
                            <SearchIcon />
                        </div>                        
                        <InputBase
                            placeholder="Product…"
                            classes={{
                                root: cl.inputRoot,
                                input: cl.inputInput,
                            }}
                            inputProps={{ 'aria-label': 'search' }}
                            onChange={(e)=>e.target.value? searchData(e.target.value):fetchData()}                 
                        />                        
                    </div>
                    {(token && token!="" && token!=undefined) ? (<Button variant="contained" color="secondary" onClick={() =>  {
                        sessionStorage.clear();
                        window.location.reload()}} style={{ marginLeft: '1rem' }} >Logout</Button>):(<Button variant="contained" color="secondary" onClick={event =>  window.location.href='http://localhost:3000/login'} style={{ marginLeft: '1rem' }} >Login</Button>)}          
                </Toolbar>
                
            </AppBar>
        </div>
      <div className={classes.root}>
        <Paper className={classes.paper}>
          <EnhancedTableToolbar numSelected={selected.length} deleteSelectedProducts={deleteSelectedProducts}/>
          <TableContainer>
            <Table
              className={classes.table}
              aria-labelledby="tableTitle"
              size={dense ? 'small' : 'medium'}
              aria-label="enhanced table"
            >
              <EnhancedTableHead
                classes={classes}
                numSelected={selected.length}
                order={order}
                orderBy={orderBy}
                onSelectAllClick={handleSelectAllClick}
                onRequestSort={handleRequestSort}
                rowCount={rows.length}
                deleteSelectedProducts = {deleteSelectedProducts}
              />
              <TableBody>
                {stableSort(rows, getComparator(order, orderBy))
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => {
                    const isItemSelected = isSelected(row.name);
                    const labelId = `enhanced-table-checkbox-${index}`;

                    return (
                      <TableRow
                        hover
                        role="checkbox"
                        aria-checked={isItemSelected}
                        tabIndex={-1}
                        key={row.name}
                        selected={isItemSelected}
                      >
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onClick={(event) => handleClick(event, row.name)}
                            inputProps={{ 'aria-labelledby': labelId }}
                          />
                        </TableCell>
                        <TableCell component="th" id={labelId} scope="row" align="left">
                          {row.id}
                        </TableCell>
                        <TableCell align="left">{row.name}</TableCell>
                        <TableCell align="left"><img src="https://picsum.photos/100" alt="" /></TableCell>
                        <TableCell align="left">{row.price}</TableCell>
                        <TableCell align="left">{row.category}</TableCell>
                        <TableCell align="left">
                          {row.id % 2 === 0 ? <Button variant="contained" color="primary">
                            In Stock
                          </Button> : <Button variant="contained" color="secondary">
                            Out of Stock
                          </Button>}</TableCell>
                        <TableCell align="left"><SimpleRating value={row.rating} /></TableCell>
                        <TableCell align="left">
                          <IconButton>
                            <EditIcon onClick={handleClickOpen} />
                          </IconButton>
                          <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                          <DialogTitle id="form-dialog-title">Edit Product</DialogTitle>
                          <DialogContent>
                            <TextField
                              autoFocus
                              margin="dense"
                              id="name"
                              label="Product Name"
                              type="text"
                              fullWidth
                              onChange={event => setName(event.target.value)}
                              required
                            />
                            <TextField
                              autoFocus
                              margin="dense"
                              id="image"
                              label="Image URL"
                              type="url"
                              fullWidth
                              onChange={event => setImage(event.target.value)}
                              required
                            />
                            <TextField
                              autoFocus
                              margin="dense"
                              id="price"
                              label="Price"
                              type="float"
                              fullWidth
                              onChange={event => setPrice(event.target.value)}
                              required
                            />
                            <TextField
                              autoFocus
                              margin="dense"
                              id="category"
                              label="Category"
                              type="text"
                              fullWidth
                              onChange={event => setCategory(event.target.value)}
                              required
                            />
                            <TextField
                              autoFocus
                              margin="dense"
                              id="stock"
                              label="Stock"
                              type="text"
                              fullWidth
                              required
                            />
                            <TextField
                              autoFocus
                              margin="dense"
                              id="rating"
                              label="Rating"
                              type="float"
                              fullWidth
                              onChange={event => setRating(event.target.value)}
                              required
                            />
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={handleClose} color="primary">
                              Cancel
                            </Button>
                            <Button onClick={()=>handleSubmit(row.id)} color="primary">
                              Submit
                            </Button>
                          </DialogActions>
                        </Dialog>                          
                          {' '}
                            <IconButton>
                              <DeleteIcon                             
                              onClick = {() => deleteProduct(row.id)}>                          
                              </DeleteIcon>
                            </IconButton>
                          
                        </TableCell>
                      </TableRow>
                    );
                  })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: (dense ? 33 : 53) * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
          
        </Paper>
        <input class="form-control" type="file" id="input" accept=".xls,.xlsx" onChange={(e)=>setSelectedFile(e.target.files[0])}></input>
        <Button variant="contained" color="primary" onClick={handleImport}>Import</Button>
        <Button variant="contained" color="secondary" style={{ marginLeft: '1rem'}} onClick={handleExport}>
          Export
        </Button>
      </div>
    </>
  );
}