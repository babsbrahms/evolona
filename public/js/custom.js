/* JS Document */

/******************************

[Table of Contents]

1. Vars and Inits
2. Set Header
3. Init Menu
4. Init Home Slider
5. Init Gallery
6. Init Testimonials Slider
7. Init Lightbox


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

	initHomeSlider();
	initMenu();
	initGallery();
	initTestSlider();
	initLightbox();

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

	4. Init Home Slider

	*/

	function initHomeSlider()
	{
		if($('.home_slider').length)
		{
			var homeSlider = $('.home_slider');

			homeSlider.owlCarousel(
			{
				items:1,
				autoplay:true,
				loop:true,
				nav:false,
				smartSpeed:1200
			});

			// Custom Navigation
			if($('.home_slider_next').length)
			{
				var next = $('.home_slider_next');
				next.on('click', function()
				{
					homeSlider.trigger('next.owl.carousel');
				});
			}

			/* Custom dots events */
			if($('.home_slider_custom_dot').length)
			{
				$('.home_slider_custom_dot').on('click', function(ev)
				{	
					var dot = $(ev.target);
					$('.home_slider_custom_dot').removeClass('active');
					dot.addClass('active');
					homeSlider.trigger('to.owl.carousel', [$(this).index(), 300]);
				});
			}

			/* Change active class for dots when slide changes by nav or touch */
			homeSlider.on('changed.owl.carousel', function(event)
			{
				$('.home_slider_custom_dot').removeClass('active');
				$('.home_slider_custom_dots li').eq(event.page.index).addClass('active');
			});	
		}
	}

	/* 

	5. Init Gallery

	*/

	function initGallery()
	{
		if($('.gallery_slider').length)
		{
			var gallerySlider = $('.gallery_slider');
			gallerySlider.owlCarousel(
			{
				items:6,
				loop:true,
				margin:22,
				autoplay:true,
				nav:false,
				dots:false,
				responsive:
				{
					0:
					{
						margin:7,
						items:3
					},
					575:
					{
						margin:7,
						items:6
					},
					991:
					{
						margin:22,
						items:6
					}
				}
			});
		}
	}

	/* 

	6. Init Testimonials Slider

	*/

	function initTestSlider()
	{
		if($('.test_slider').length)
		{
			var testSlider = $('.test_slider');
			testSlider.owlCarousel(
			{
				items:1,
				loop:true,
				autoplay:true,
				smartSpeed:1200,
				nav:false,
				dots:false
			});
		}
	}

	/*

	7. Init Lightbox

	*/

	function initLightbox()
	{
		if($('.gallery_item').length)
		{
			$('.colorbox').colorbox(
			{
				rel:'colorbox',
				photo: true,
				maxWidth:'95%',
				maxHeight:'95%'
			});
		}
	}

	// add to cart
	$('.product_content').on('click', function(e) {
		var size = '';
		var index = ''
		if(e.target.classList.contains('cart')) {
			var id = e.target.getAttribute('data-id');
			var imgs = JSON.parse(e.target.getAttribute('data-imgs'))
			var price = e.target.getAttribute('data-price')
			var name = e.target.getAttribute('data-name')

			

			if (e.target.nodeName === 'IMG') {
				index = e.target.parentNode.parentNode.parentNode.children[2]	
				size = index.value
			}
	
			if (e.target.nodeName === 'DIV') {
				index = e.target.parentNode.parentNode.children[2]
				size = index.value
			}

		
			if (!size) {
				window.alert('Product is out of order')
			} else {
				fetch(`/product/addToCart`, {
					method: 'POST',
					headers: { 'Content-Type': 'Application/Json'},
					credentials: 'include',
					body: JSON.stringify({
						size,
						id,
						qty: 1,
						pictures: imgs,
						price: Number(price),
						name
					})
				})
				.then((dt) =>{
				
					
					window.location.reload()
				})
				.catch(() => window.alert('Problem adding product to cart'))
			}
			
		}
	});


	// add type
	let url = window.location.pathname;
	let type = document.getElementById("type");

	if (url === "/") {
		type.children[0].setAttribute("class", "evo_type evo_active")
	} else if (url === "/type/shoes") {
		type.children[1].setAttribute("class", "evo_type evo_active")
	} else if (url === "/type/bags") {
		type.children[2].setAttribute("class", "evo_type evo_active")
	} else if (url === "/type/clothes") {
		type.children[3].setAttribute("class", "evo_type evo_active")
	} else if (url === "/type/watches") {
		type.children[4].setAttribute("class", "evo_type evo_active")
	} else if (url === "/type/others") {
		type.children[5].setAttribute("class", "evo_type evo_active")
	}
});