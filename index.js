
const fs = require('fs');  
const express = require('express');
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log('Todo bien');
})
// Obtiene los datos que se encuentran en el catalogo
app.get('/BD/:filter/:ID', (req, res) => {
    let filter = req.params.filter;
    let keyword = req.params.keyword;
    let sData = fs.readFileSync('./BD.txt', 'utf8');

    let aProducts = JSON.parse(sData);
    let queryRes = aProducts.filter(product => product[filter] === keyword);

    res.send(queryRes);
})

app.get('/BD', (req, res) => {
    let sData = fs.readFileSync('./BD.txt', 'utf8');
    let aProducts = JSON.parse(sData);
    res.send(aProducts);
})

app.get('/car', (req, res) => {
    let carrData = fs.readFileSync('./car.txt', 'utf8');
    
    let carrProducts = JSON.parse(carrData);
    res.send(carrProducts);
})
// elimina datos de la tabla
app.delete('/car', (req, res) => {
    fs.writeFileSync('./cart.txt', '[]');
    res.send('carrito vacio');
})

app.post('/car/products/:product', (req, res) => {
    let carrData = fs.readFileSync('./car.txt', 'utf8');
    let carrProducts = JSON.parse(carrData);
    
    let noProduct = JSON.parse(req.params.product);
    const index = carrProducts.findIndex(product => product.id === noProduct.id);

    // vwerificacion sai existe algun producto
    if(index === -1){
        carrProducts.push(noProduct);
    }else{
        carrProducts.splice(index, 1, noProduct);
    }

    fs.writeFileSync('./car.txt', '');
    fs.writeFileSync('./car.txt', JSON.stringify(carrProducts)); 

    res.send('Productos añadidos al carrito');
})
// Agrega productos 
app.put('/car/products/:id/:quantity', (req, res) => {
    let carrData = fs.readFileSync('./car.txt', 'utf8');
    let carrProducts = JSON.parse(carrData);
    
    let quant = parseInt(req.params.quantity);
    let productId = parseInt(req.params.id);

    // obtiene la lista y el producto
    const index = carrProducts.findIndex(product => product.id === productId);
    const match = carrProducts[index];

    match.quantity = quant;

    carrProducts.splice(index, 1, match);

    fs.writeFileSync('./car.txt', '');
    fs.writeFileSync('./car.txt', JSON.stringify(carrProducts));
    res.send('producto añadido al carrito ');
})
// Elimina productos del catalogo mediante el ID
app.delete('/car/products/:id', (req, res) => {
    let carrData = fs.readFileSync('./car.txt', 'utf8');
    let carrProducts = JSON.parse(carrData);
    
    let productId = parseInt(req.params.id);


    // ontiene el indice
    const index = carrProducts.findIndex(product => product.id === productId);
    
    carrProducts.splice(index, 1);

    fs.writeFileSync('./car.txt', '');
    fs.writeFileSync('./car.txt', JSON.stringify(carrProducts));
    res.send('producto eliminado');
})

app.post('/checkout', (req, res) => {
    let msg = '';
    let total = 0;
    let errFlag = 0;
    let carrData = fs.readFileSync('./car.txt', 'utf8');
    let carrProducts = JSON.parse(cData);

    let sData = fs.readFileSync('./BD.txt', 'utf8');
    let aProducts = JSON.parse(sData);

    // check if a product's quantity exceeds the warehouse quantity
    carrProducts.forEach(product => {
        let index = aProducts.findIndex(wProd => wProd.id === product.id)
        total += parseInt(aProducts[index].price) * product.quantity;
        if(product.quantity > aProducts[index].quantity){
            errFlag = 1;
        }
    });
    
    if(errFlag === 0){
        
        carrProducts.forEach(product => {
            let index = aProducts.findIndex(aProd => aProd.id === product.id)
            aProducts[index].quantity -= product.quantity;
        });

        msg = 'verificando el carrito. el total es ' + total;
        fs.writeFileSync('./car.txt', '[]');
        fs.writeFileSync('./BD.txt', '');
        fs.writeFileSync('./BD.txt', JSON.stringify(aProducts));

    }else{
        msg = 'error. la cantidad seleccionada excede el stock'
    }
    
    res.send(msg);
})

