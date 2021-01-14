function Cart (cart) {
    this.products = cart.products || [];
    this.total_price = cart.total_price || 0;
    this.total_qty = cart.total_qty || 0;

    this.addProduct = function (product, size, qty) {
      var index = this.products.findIndex(function(x){
        return (x.id === product.id) && (x.size === size)
      })
      if (index >= 0) {
        this.products[index].qty+= Number(qty);
        this.products[index].price = product.price;

      } else {
        var newCart = {}
        newCart.id = product.id; 
        newCart.name = product.name; 
        newCart.qty = Number(qty); 
        newCart.price= product.price; 
        newCart.size= size, 
        newCart.product= product;

        this.products.push(newCart)
      }

      this.total_qty += Number(qty);
      this.total_price += (product.price * Number(qty));
    }

    this.deleteProduct = function (id, size) {
      var index = this.products.findIndex(function(x){
        return (x.id === id) && (x.size === size)
      })
      if (index >= 0) {
        this.total_qty -= this.products[index].qty;
        this.total_price -= (this.products[index].price * this.products[index].qty);

        // rmove it
        this.products.splice(index, 1)
      }
    }

    this.updateCart = function (id, size, qty) {
      var index = this.products.findIndex(function(x){
        return (x.id === id) && (x.size === size)
      })
      if (index >= 0) {
        this.total_qty = this.total_qty + Number(qty) - this.products[index].qty;
        this.total_price = this.total_price + (this.products[index].price * Number(qty)) - (this.products[index].price * this.products[index].qty);

        this.products[index].qty = Number(qty);
      }

    }

    this.clearCart = function () {
      this.total_price = 0;
      this.total_qty = 0;
      this.products = [];
    }
}

module.exports = Cart;

  // var cart = {
//   products: [
//     { id: 0, name: 'Clothing One', qty: 1, price: 2000, size: 'M', product: clothings[0] },
//     { id: 1, name: 'Clothing Two', qty: 1, price: 2000, size: 'S', product: clothings[0] },
//     {id: 2, name: 'Clothing Three', qty: 2, price: 2000, size: 'L', product: clothings[0] },
//   ],
//   total_price: 8000,
//   total_qty: 10
// }