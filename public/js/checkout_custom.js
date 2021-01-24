/* JS Document */

/******************************

[Table of Contents]

1. Vars and Inits
2. Set Header
3. Init Menu


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
	// var choosen_state = document.getElementById('state');
	var hidde_total_price = document.getElementById('hidde_total_price');
	var alert = document.getElementById('alert');

	// setting styles
	alert.style.display = 'none';

	// setting shipping price and total price
	// document.getElementById('shipping').innerHTML = '$' + choosen_state.value;
	// var total = Number(hidde_total_price.value) + Number(choosen_state.value)
	// document.getElementById('total_price').innerHTML = '$' + total;



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


	// get shipping price
	// choosen_state.addEventListener('change', changePrice)

	//  function changePrice (){
	// 	document.getElementById('shipping').innerHTML = choosen_state.value + ' US Dollar';
	// 	var total = Number(hidde_total_price.value) + Number(choosen_state.value)
	// 	document.getElementById('total_price').innerHTML = total + ' US Dollar';
	// }
	
	
	
	// payment
	// live key
	const API_publicKey = "FLWPUBK-748ced89d0a7bacb39f42abed5f452e8-X";
	// test key
	// const API_publicKey = 'FLWPUBK_TEST-b1517ebc9f27980773d303e99c754d23-X'
	var ref = "MX-"+Date.now()+Math.ceil(Math.random()*100000);
	
	document.getElementById('payWithRave').onclick = payWithRave;


  function payWithRave(e) {
	  	//remove alert
		alert.style.display = 'none';
		
		// get for data
		var form = document.getElementById('checkout_form');
		var first = form['first_name'].value;
		var last = form['last_name'].value;
		var email = form['email'].value;
		var country = form['country'].value;
		// var stateIndex = form['state'].selectedIndex;
		var state = form['state'].value
		var city = form['city'].value;
		var address = form['address'].value;
		var phone = form['phone'].value;
		var amount =  Number(hidde_total_price.value) + Number(5.99)
		var shipping = 5.99;
		var cart = e.target.getAttribute('data_cart')
		var token = document.querySelector('meta[name="csrf-token"]').getAttribute('content')

		
		
		var reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		if (first && last && email && country && state && city && address && phone) {
			if (!reg.test(email)) {
				alert.style.display = 'block';
				alert.innerHTML = 'Add valid email'
				// window.alert('Add valid email')
				return
			}
			// set value in localstorage
			var userObj = {
				first, last, 
				email, 
				country, state, city , address, phone, amount, shipping
			}

			console.log({...userObj, newState: state, txRef: ref });
			

			window.localStorage.setItem('userObj', JSON.stringify(userObj))

			// check if product is stil available
            fetch('/checkout/verify',{
				credentials: 'include',
				// credentials: 'same-origin', // <-- includes cookies in the request
				headers: {
					'CSRF-Token': token // <-- is the csrf token as a header
				  },
				method: 'GET'
			})
            .then((r) => r.json())
			.then((res) =>{
        
               
				if (res.data === 'expired_session' ) {
					//window.location.reload()
					alert.innerHTML = 'Your session expired. Add product to shopping cart.'
						//window.alert('Your session expired. Add product to shopping cart.')
						
                } else if (res.data  === 'error' ) {
					//window.location.reload()
					alert.innerHTML = 'Your session expired. Add product to shopping cart.'
                       // window.alert('Problem verifying your cart.')                  
                } 
                else if (res.data === 'done') {
					if(res.modify === true) {
						window.location.reload()
						alert.innerHTML = 'Your cart is updated due to the remaining quantity in stock. Please re-check your cart before you proceed.'
						window.alert('Your cart is updated due to the remaining quantity in stock. Please re-check your cart before you proceed.') 
					} else {
						
                        // make payment
                        var x = getpaidSetup({
                            PBFPubKey: API_publicKey,
							customer_email: email,
							customer_firstname: first,
							customer_lastname: last,
                            amount: amount,
                            customer_phone: phone,
                            currency: "USD",
							txref: ref,
							redirect_url: `/checkout/confirmation/${ref}`,
                            meta: [{
                                metaname: "flightID",
                                metavalue: "AP1234"
                            }],
                            onclose: function() {},
                            callback: function(response) {
                                var txref = response.tx.txRef; // collect txRef returned and pass to server page to complete status check.

                                if (
                                    response.tx.chargeResponseCode == "00" ||
                                    response.tx.chargeResponseCode == "0"
                                ) {
									e.target.style.display = 'none'
									alert.style.display = 'block';
									alert.classList.remove('alert-danger');
									alert.classList.add('alert-success');
									alert.innerHTML = 'Verify your payment and saving your order. Please wait...';
                                    // redirect to a success page
                                    fetch('/checkout/order', {
										credentials: 'include',
										// credentials: 'same-origin', // <-- includes cookies in the request
										headers: {
										  'CSRF-Token': token, // <-- is the csrf token as a header
										  "Content-Type": 'application/json'
										},
                                        method: 'POST',
                                        body: JSON.stringify({
                                            txref,
                                            name: `${first} ${last}`,
                                            email,
                                            address,
											state,
											city,
											country,
											phone,
											shipping,
											cart: JSON.parse(cart)
                                        })
									})
									.then((res) => res.json())
                                    .then((dt) =>{
									//	window.location.reload()
										alert.style.display = 'block';
										alert.classList.remove('alert-danger');
										alert.classList.add('alert-success');
										alert.innerHTML = dt.msg;
									})
                                    .catch((err) =>{
										alert.style.display = 'block';
										alert.classList.remove('alert-success');
										alert.classList.add('alert-dander');
										alert.innerHTML = err.msg
									})
                                } else {
                                    // redirect to a failure page.
                                    alert.style.display = 'block';
                                    alert.innerHTML = response.message
                                
                                }

                                x.close(); // use this to close the modal immediately after payment.
                            }
                        });
					}
				}

			})
			.catch(() => {
				alert.style.display = 'block';
				alert.innerHTML = 'Problem verifying your cart. Try again later...';
                //window.alert('Problem verifying your cart. Try again later...')
			})
			
		
		} else {
			alert.style.display = 'block';
			alert.innerHTML = 'Complete billing details to order product'
			// window.alert('Complete billing details to order product')
		}
		
    }
});


	// // set form from localstorage
	var userDa = JSON.parse(window.localStorage.getItem('userObj'));
	
	if(userDa != undefined) {
		var form = document.getElementById('checkout_form');
		form['first_name'].value = userDa.first;
		form['last_name'].value = userDa.last;
		// form['email'].value = userDa.email;
		form['country'].value = userDa.country;
		form['state'].value = userDa.state;
		form['city']. value = userDa.city || "";
		form['address'].value = userDa.address;
		form['phone'].value = userDa.phone;

	// 	// chnage price
	// 	var choosen_state = document.getElementById('state');
	// 	document.getElementById('shipping').innerHTML = choosen_state.value + ' US Dollar';
	// 	var total = Number(hidde_total_price.value) + Number(choosen_state.value)
	// 	document.getElementById('total_price').innerHTML = total + ' US Dollar';
	}


