/* JS Document */

/******************************

[Table of Contents]

1. Vars and Inits
2. Set Header
3. Init Menu
4. Init Quantity


******************************/

$(document).ready(function()
{
	"use strict";

	/* 

	1. Vars and Inits

	*/

	var header = $('.header');
	var menuActive = false;
	var menu = $('.menu');
	var burger = $('.burger_container');

	setHeader();

	$(window).on('resize', function()
	{
		setHeader();
	});

	$(document).on('scroll', function()
	{
		setHeader();
	});

	initMenu();
	initQuantity();

	/* 

	2. Set Header

	*/

	function setHeader()
	{
		if($(window).scrollTop() > 100)
		{
			header.addClass('scrolled');
		}
		else
		{
			header.removeClass('scrolled');
		}
	}

	/* 

	3. Init Menu

	*/

	function initMenu()
	{
		if($('.menu').length)
		{
			var menu = $('.menu');
			if($('.burger_container').length)
			{
				burger.on('click', function()
				{
					if(menuActive)
					{
						closeMenu();
					}
					else
					{
						openMenu();

						$(document).one('click', function cls(e)
						{
							if($(e.target).hasClass('menu_mm'))
							{
								$(document).one('click', cls);
							}
							else
							{
								closeMenu();
							}
						});
					}
				});
			}
		}
	}

	function openMenu()
	{
		menu.addClass('active');
		menuActive = true;
	}

	function closeMenu()
	{
		menu.removeClass('active');
		menuActive = false;
	}

	/* 

	4. Init Quantity

	*/

	function initQuantity()
	{
		// Handle product quantity input
		if($('.product_quantity').length)
		{
			var input = $('#quantity_input');
			var incButton = $('#quantity_inc_button');
			var decButton = $('#quantity_dec_button');

			var originalVal;
			var endVal;

			incButton.on('click', function()
			{
				originalVal = input.val();
				endVal = parseFloat(originalVal) + 1;
				input.val(endVal);
			});

			decButton.on('click', function()
			{
				originalVal = input.val();
				if(originalVal > 0)
				{
					endVal = parseFloat(originalVal) - 1;
					input.val(endVal);
				}
			});
		}
	}

	// button_clear
	document.getElementById('button_clear').addEventListener('click', function() {
		fetch('/cart/clear_cart', {
			method: 'GET',
			credentials: 'include'
		})
		.then(() => {
			window.location.reload() 
		})
		.catch(() => window.alert('Problem clearing cart'))
		
	});

	// to checkoutpage
	document.getElementById('to_checkout').addEventListener('click', function() {
		fetch('/cart/exit_cart')
		.then(() =>{
			window.location.href = '/checkout'
		})
		.catch(() => window.alert('Unable go to checkout'))
		
	});

	// update qty change
	document.getElementById('cart_ul').addEventListener('change', function(e) {
		if (e.target.classList.contains('product_qty')) {
			var id = e.target.getAttribute('data-id');
			var size = e.target.getAttribute('data-size');
			var qty = Number(e.target.value);
	
			
			
			if (qty >=0) {				
				e.target.value = qty;
				fetch(`/cart/update_cart?id=${id}&size=${size}&qty=${qty}`,{
					method: 'GET',
					credentials: 'include'
				})
				.then(() =>{
					window.location.reload()
				})
				.catch(() => window.alert('Problem updating cart'))
			} else {
				e.target.value = 0;
			}
			

		}
	});
	


	// //button_update
	// document.getElementById('button_update').addEventListener('click', function() {
	// 	fetch('/cart/update_cart', {
	// 		method: 'POST',
	// 		headers: { "Content-Type": 'Application/Json'},
	// 		body: JSON.stringify({
	// 			name: 'olayinka'
	// 		})
	// 	})
	// 	.then(data => console.log(data))
	// 	// .then(() => window.location.reload() )
	// 	.catch(() => window.alert('Problem updating cart'))
	// });

	// remove
	document.getElementById('cart_ul').addEventListener('click', function(e) {
		var productId = '';
		var size = ''
		if(e.target.classList.contains('cart_product_remove')) {
			productId = e.target.children[0].getAttribute('data-id')
			size = e.target.children[0].getAttribute('data-size')
			deleteProduct(productId, size)
		}

		if(e.target.classList.contains('cart_product_button')) {
			productId = e.target.getAttribute('data-id')
			size = e.target.getAttribute('data-size')
			deleteProduct(productId, size)
		}

		if(e.target.classList.contains('cart_trash')) {
			productId = e.target.parentNode.getAttribute('data-id')
			size = e.target.parentNode.getAttribute('data-size')
			deleteProduct(productId, size)
		}
	});

	function deleteProduct (id, size) {
		fetch(`/cart/delete_cart?id=${id}&size=${size}`, {
			method: 'DELETE',
			credentials: 'include'
		})
		.then(() => window.location.reload() )
		.catch(() => window.alert('Problem deleting cart'))
		
	}

});
