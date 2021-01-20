/* JS Document */

/******************************

[Table of Contents]

1. Vars and Inits
2. Set Header
3. Init Menu
4. Init Image
5. Init Quantity


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
	var cart_button = document.querySelector('.cart_button')
	var size = undefined;
	var alert = document.getElementById('alert');
	var p_sizes = document.getElementById('size_ul').getAttribute("data-sizes");
	var product_sizes = JSON.parse(p_sizes)
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
	initImage();
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

	4. Init Image

	*/

	function initImage()
	{
		var images = $('.product_image_thumbnail');
		var selected = $('.product_image_large img');

		images.each(function()
		{
			var image = $(this);
			image.on('click', function()
			{
				var imagePath = new String(image.data('image'));
				selected.attr('src', imagePath);
			});
		});
	}

	/* 

	5. Init Quantity

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

	// alert no-show
	alert.style.display = 'none';
	
	
	// add default size for regular
	if ((product_sizes.length > 0) && (product_sizes[0].size === "REGULAR")) {
		size = "REGULAR"
	}

	// when size is changed
	document.getElementById('size_ul').addEventListener('click', function(e) {
		size = e.target.value;
	})
	

	// submit to cart
	cart_button.addEventListener('click' , function(e){
		e.preventDefault();
		var quantity_input = document.getElementById('quantity_input').value;
		var productId = document.getElementById('product_id')
		var id = productId.value;
		var imgs = JSON.parse(productId.getAttribute('data-imgs'));
		var price = productId.getAttribute('data-price')
		var name = productId.getAttribute('data-name')
		if (size == undefined) {	
			alert.style.display = 'block';
			alert.innerHTML = 'add your size'
			return
		}
		alert.style.display = 'none';
		

		fetch(`/product/addToCart`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'Application/Json'},
			body: JSON.stringify({
				size,
				id,
				qty: Number(quantity_input),
				pictures: imgs,
				price: Number(price),
				name
			})
		})
		.then(() =>{
			window.location.reload()
		})
		.catch(() => {
			alert.style.display = 'block';
			// alert.classList.toggle('alert-danger');
			alert.innerHTML = 'Problem adding product to cart'
		})
		
		
	})
});