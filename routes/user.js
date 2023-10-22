const express = require('express');

const { body, validationResult } = require('express-validator');

const QRCode = require('qrcode');
// const QRCode = require('ethereum-qr-code');

const request = require("request");

const baseUrl = "https://bhaveshnetflix.live/web_api/";

const isAuth = require('../middleware/is_auth');

const router = express.Router();

let selectFunction = (item) => {
  let options = {
	  method: "POST",
	  url: baseUrl + "select.php",
	  headers: {
	  	charset: 'UTF-8'
	  },
	  formData: {
	    select_query: item,
	  },
  };
  return options;
};

let insertFunction = (item, item2) => {
  let options = {
    method: "POST",
    url: baseUrl + "insert.php",
    formData: {
      insert_query: item,
      select_query: item2,
    },
  };
  return options;
};

let updateFunction = (item, item2) => {
	let options = {
	    method: "POST",
	    url: baseUrl + "update.php",
	    formData: {
	      update_query: item,
	      select_query: item2,
	    },
  	};
  	return options;
};

let deleteFunction = (item, item2) => {
	let options = {
	    method: "POST",
	    url: baseUrl + "delete.php",
	    formData: {
	      delete_query: item,
	      select_query: item2,
	    },
  	};
  	return options;
};

router.get('/', async(req, res, next) => {
	try {
		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;
		const category = req.query.category || 'new';

		let opt1 = selectFunction(
			"select ec_product_collection_products.product_id, ec_products.name as pName, ec_products.image, ec_products.price, ec_product_collections.slug as label, ec_product_labels.name as lname, ec_product_categories.name as category from ec_product_collections inner join ec_product_collection_products on ec_product_collections.id = ec_product_collection_products.product_collection_id inner join ec_products on ec_product_collection_products.product_id = ec_products.id inner join ec_product_label_products on ec_product_label_products.product_id = ec_products.id inner join ec_product_labels on ec_product_labels.id = ec_product_label_products.product_label_id inner join ec_product_category_product on ec_product_category_product.product_id = ec_product_collection_products.product_id inner join ec_product_categories on ec_product_categories.id = ec_product_category_product.category_id"
		);

		let isAuthenticated = false;

		request(opt1, (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				// console.log(x.length, category, page);
				// console.log(req.session.isLoggedIn, req.session.user, req.session.user == '');

				const email = req.session.user;

				(email !== '' ? isAuthenticated = true : isAuthenticated = false);

				// console.log(isAuthenticated);

				let opt2 = selectFunction(
					"select * from hCart where email = '"
					.concat(`${email}`)
					.concat("'")
				);

				request(opt2, (error, response) => {
					if (error) throw new Error(error);
					else {
						let y = JSON.parse(response.body);

						// console.log(y);

						if (x.length >= 1) {
							const newProducts = x.filter((product) => product.label === 'new-arrival');
							const bestSellers = x.filter((product) => product.label === 'best-sellers');
							const specialOffers = x.filter((product) => product.label === 'special-offer');

							// console.log(newProducts, bestSellers, specialOffers);
							let nPPages = [];
							let bSPages = [];
							let sOPages = [];

							if (category === 'new') {
								nPPages = paginateProducts(newProducts, page);
								bSPages = paginateProducts(bestSellers, cp = 1);
								sOPages = paginateProducts(specialOffers, cp = 1);
							}

							else if (category === 'bestsellers') {
								nPPages = paginateProducts(newProducts, cp = 1);
								bSPages = paginateProducts(bestSellers, page);
								sOPages = paginateProducts(specialOffers, cp = 1);
							}

							else if (category === 'special_offer') {
								nPPages = paginateProducts(newProducts, cp = 1);
								bSPages = paginateProducts(bestSellers, cp = 1);
								sOPages = paginateProducts(specialOffers, page);
							}

							else {
								nPPages = paginateProducts(newProducts, cp = 1);
								bSPages = paginateProducts(bestSellers, cp = 1);
								sOPages = paginateProducts(specialOffers, cp = 1);
							}

					    function paginateProducts(newProducts, cp) {
								const totalCount = newProducts.length;
					      const pageCount = Math.ceil(totalCount / itemsPerPage);

					      // Calculate start and end indices for pagination
					      const startIndex = (cp - 1) * itemsPerPage;
					      const endIndex = startIndex + itemsPerPage;

					      // Slice the results array based on pagination
					      const paginatedResults = newProducts.slice(startIndex, endIndex);
					      return {data: paginatedResults, pageCount: pageCount};
					    }

							const { data: nData, pageCount: nPC } = nPPages;
							const { data: bsData, pageCount: bsPC } = bSPages;
							const { data: soData, pageCount: soPC } = sOPages;

							// console.log(nPC, bsPC, soPC);
							// console.log(nData.length, bsData.length, soData.length);

							return res.render('user/home', 
								{
									title: "Home",
									lang: req.lang,
									isAuth: isAuthenticated,
									cart: y.length,
									// cart: '6',
									nData: nData,
									bsData: bsData,
									soData: soData,
									category: category,
									currentPage: page,
				        	nPC: nPC,
				        	bsPC: bsPC,
				        	soPC: soPC
								}
							)
						}

						else {
							return res.render('user/home', 
								{
									title: "Home",
									lang: req.lang,
									isAuth: isAuthenticated,
									cart: y.length,
									nData: [],
									bsData: [],
									soData: [],
									category: category,
									currentPage: page,
				        	nPC: 0,
				        	bsPC: 0,
				        	soPC: 0
								}
							)
						}
					}
				})
			}
		})
	}

	catch(error) {
		return res.render('user/home', 
			{
				title: "Home",
				lang: req.lang,
				isAuth: isAuthenticated,
				cart: '0',
				nData: [],
				bsData: [],
				soData: [],
				category: '',
				currentPage: '',
				nPC: 0,
				bsPC: 0,
				soPC: 0
			}
		)
	}
})

router.get('/v1/details/:name', async (req, res, next) => {
	try {
		const { name } = req.params;

		// console.log(name);

		let opt1 = selectFunction(
			"select ec_products.id, ec_products.name as pName, ec_products.image, ec_products.price, ec_product_categories.name as category, ec_product_labels.name as label from ec_products left join ec_product_category_product on ec_product_category_product.product_id = ec_products.id left join ec_product_categories on ec_product_categories.id = ec_product_category_product.category_id left join ec_product_label_products on ec_product_label_products.product_id = ec_products.id left join ec_product_labels on ec_product_labels.id = ec_product_label_products.product_label_id where ec_products.name = '"
				.concat(`${name}`)
				.concat("' limit 10 offset 0")
		);

		let isAuthenticated = false;

		request(opt1, (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				const email = req.session.user;

				(email !== '' ? isAuthenticated = true : isAuthenticated = false);

				// console.log(isAuthenticated);

				const category = x[0].category;
				const label = x[0].label;

				// console.log(category, label);

				let opt2 = selectFunction(
					"select ec_products.id, ec_products.name as pName, ec_products.image, ec_products.price, ec_product_categories.name as category, ec_product_labels.name as label from ec_products left join ec_product_category_product on ec_product_category_product.product_id = ec_products.id left join ec_product_categories on ec_product_categories.id = ec_product_category_product.category_id left join ec_product_label_products on ec_product_label_products.product_id = ec_products.id left join ec_product_labels on ec_product_labels.id = ec_product_label_products.product_label_id where ec_product_categories.name = '"
					.concat(`${category}`)
					// .concat("' AND ec_product_collections.slug = '")
					// .concat(`${label}`)
					.concat("' limit 3 offset 0")
				);

				request(opt2, (error, response) => {
					if (error) throw new Error(error);
					else {
						let z = JSON.parse(response.body);

						// console.log(z);

						if (x.length >= 1) {
							let opt3 = selectFunction(
								"select * from hCart where email = '"
									.concat(`${email}`)
									.concat("'")
							);

							request(opt3, (error, response) => {
								if (error) throw new Error(error);
								else {
									let y = JSON.parse(response.body);

									// console.log(y);

									if (y.length >= 1) {
										return res.render("user/details", {
											title: "Details",
											lang: req.lang,
											products: x,
											name: name,
											relatedProduct: z,
											isAuth: isAuthenticated,
											cart: y.length
										})
									}

									else {
										return res.render('user/details', 
											{
												title: "Details",
												lang: req.lang,
												products: x,
												name: name,
												relatedProduct: z,
												isAuth: isAuthenticated,
												cart: 0
											}
										)
									}
								}
							})
						}

						else {
							return res.render('user/details', 
								{
									title: "Details",
									lang: req.lang,
									products: x,
									name: name,
									relatedProduct: z,
									isAuth: isAuthenticated,
									cart: 0
								}
							)
						}
					}
				})
			}
		})
	}

	catch(error) {
		return res.render('user/details', 
			{
				title: "Details",
				lang: req.lang,
				products: [],
				name: '',
				relatedProduct: [],
				isAuth: false,
				cart: '0'
			}
		)
	}
})

router.get('/v1/product_categories', async (req, res, next) => {
	try {
		const { category, name } = req.query;

		const page = parseInt(req.query.page) || 1;
		const itemsPerPage = 10;

		// console.log(category, name, page);

		let opt1 = '';

		let isAuthenticated = false;

		if (category == undefined && name !== '') {
			opt1 = selectFunction(
				"select ec_products.id, ec_products.name as pName, ec_products.image, ec_products.price, ec_product_categories.name as category, ec_product_labels.name as label from ec_products left join ec_product_category_product on ec_product_category_product.product_id = ec_products.id left join ec_product_categories on ec_product_categories.id = ec_product_category_product.category_id left join ec_product_label_products on ec_product_label_products.product_id = ec_products.id left join ec_product_labels on ec_product_labels.id = ec_product_label_products.product_label_id where ec_products.name = '"
				.concat(`${name}`)
				.concat("'")
			);
		}

		else if (category !== '' && name !== '') {
			opt1 = selectFunction(
				"select ec_products.id, ec_products.name as pName, ec_products.image, ec_products.price, ec_product_categories.name as category, ec_product_labels.name as label from ec_products left join ec_product_category_product on ec_product_category_product.product_id = ec_products.id left join ec_product_categories on ec_product_categories.id = ec_product_category_product.category_id left join ec_product_label_products on ec_product_label_products.product_id = ec_products.id left join ec_product_labels on ec_product_labels.id = ec_product_label_products.product_label_id where ec_product_categories.name = '"
				.concat(`${category}`)
				.concat("' AND ec_products.name = '")
				.concat(`${name}`)
				.concat("'")
			);
		}

		else if (category !== '' && !name) {
			opt1 = selectFunction(
				"select ec_products.id, ec_products.name as pName, ec_products.image, ec_products.price, ec_product_categories.name as category, ec_product_labels.name as label from ec_products left join ec_product_category_product on ec_product_category_product.product_id = ec_products.id left join ec_product_categories on ec_product_categories.id = ec_product_category_product.category_id left join ec_product_label_products on ec_product_label_products.product_id = ec_products.id left join ec_product_labels on ec_product_labels.id = ec_product_label_products.product_label_id where ec_product_categories.name = '"
				.concat(`${category}`)
				.concat("'")
			);
		}

		else if (category == undefined && name == undefined) {
			opt1 = selectFunction(
				"select ec_products.id, ec_products.name as pName, ec_products.image, ec_products.price, ec_product_categories.name as category, ec_product_labels.name as label from ec_products left join ec_product_category_product on ec_product_category_product.product_id = ec_products.id left join ec_product_categories on ec_product_categories.id = ec_product_category_product.category_id left join ec_product_label_products on ec_product_label_products.product_id = ec_products.id left join ec_product_labels on ec_product_labels.id = ec_product_label_products.product_label_id"
			);
		}

		else {
			return res.redirect("/");
		}

		request(opt1, (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				const email = req.session.user;

				(email !== '' ? isAuthenticated = true : isAuthenticated = false);

				// console.log(isAuthenticated);

				let opt2 = selectFunction(
					"select * from hCart where email = '"
					.concat(`${email}`)
					.concat("' limit 10 offset 0")
				);

				request(opt2, (error, response) => {
					if (error) throw new Error(error);
					else {
						let z = JSON.parse(response.body);

						// console.log(z);
						if (x.length >= 1) {
							const totalCount = x.length;
				      const pageCount = Math.ceil(totalCount / itemsPerPage);

				      // Calculate start and end indices for pagination
				      const startIndex = (page - 1) * itemsPerPage;
				      const endIndex = startIndex + itemsPerPage;

				      // Slice the results array based on pagination
				      const paginatedResults = x.slice(startIndex, endIndex);
				      // console.log(paginatedResults);
				      // console.log(pageCount);

							return res.render("user/category", {
								title: "Category",
								lang: req.lang,
								products: paginatedResults,
								category: category,
								name: name,
								isAuth: isAuthenticated,
								cart: z.length,
								currentPage: page,
				        pageCount: pageCount
							})
						}

						else {
							return res.render("user/category", {
								title: "Category",
								lang: req.lang,
								products: [],
								category: category,
								name: name,
								isAuth: isAuthenticated,
								cart: z.length,
								currentPage: 0,
				        pageCount: 0
							})
						}
					}
				})
			}
		})
	}

	catch(error) {
		return res.redirect("/");
	}
})

// isAuth
router.post('/v1/cart', isAuth, async (req, res, next) => {
	try {
		const { quantity, productId } = req.body;

		// console.log(req.body);

		const email = req.session.user;
		// const email = "aabb@gmail.com";

		let opt1 = selectFunction(
			"select * from ec_products where id = '"
			.concat(`${productId}`)
			.concat("' limit 10 offset 0")
		);

		request(opt1, (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					let values1 = `\'${email}\', '${productId}\', '${quantity}\'`;

					let opt2 = insertFunction(
					  "insert into hCart (email, product_id, quantity) values(" 
					  .concat(`${values1}`)
					  .concat(")"),
						"select * from hCart where email = '"
						.concat(`${email}`)
						.concat("' limit 10 offset 0")
					);

					request(opt2, (error, response) => {
						if (error) throw new Error(error);
						else {
							let y = JSON.parse(response.body);

							// console.log(y);

							if (y.length >= 1) {
								return res.redirect("/v1/cart");
							}

							else {
								return res.redirect("/v1/cart");
							}
						}
					})
				}

				else {
					return res.redirect("/v1/cart");
				}
			}
		})
	}

	catch(error) {
		return res.redirect("/v1/cart");
	}
})

router.get("/v1/cart", async (req, res, next) => {
	const email = req.session.user;
	// const email = "a@gmail.com";

	let message = req.flash('error');
	// console.log(message);

	if (message.length > 0) {
		message = message[0];
	}
	else {
		message = null;
	}

	if (email) {
		let opt1 = selectFunction(
			"select * from hCart where email = '"
			.concat(`${email}`)
			.concat("' limit 10 offset 0")
		);

		request(opt1, async (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					let opt2 = selectFunction(
						"select SUM(hCart.quantity * ec_products.price) AS totalPrice from hCart INNER JOIN ec_products ON hCart.product_id=ec_products.id WHERE email = '"
						.concat(`${email}`)
						.concat("'")
					);

					request(opt2, async (error, response) => {
						if (error) throw new Error(error);
						else {
							let y = JSON.parse(response.body);

							// console.log(y);

							let opt3 = selectFunction(
								"select hCart.quantity, ec_products.price, ec_products.name, ec_products.image, ec_products.id from hCart INNER JOIN ec_products ON hCart.product_id=ec_products.id WHERE email = '"
								.concat(`${email}`)
								.concat("'")
							);

							request(opt3, async (error, response) => {
								if (error) throw new Error(error);
								else {
									let z = JSON.parse(response.body);

									// console.log(z);

									if (z.length >= 1) {
										return res.render("user/cart", {
											title: 'Cart',
											lang: req.lang,
											errorMessage: message,
											products: z,
											isAuth: true,
											cart: x.length
										})
									}

									else {
										return res.render("user/cart", {
											title: 'Cart',
											lang: req.lang,
											errorMessage: message,
											products: [],
											isAuth: true,
											cart: x.length
										})
									}
								}
							})
						}
					})
				} 

				else {
					return res.render("user/cart", {
						title: 'Cart',
						lang: req.lang,
						errorMessage: message,
						products: [],
						isAuth: true,
						cart: x.length
					})
				}
			}
		})
	}

	else {
		return res.render("user/cart", {
			title: 'Cart',
			lang: req.lang,
			errorMessage: message,
			products: [],
			isAuth: false,
			cart: '0'
		})
	}
})

// isAuth
router.post("/v1/updateCart", isAuth, async (req, res, next) => {
	try {
		const { quantity, productId } = req.body;

		// console.log(req.body);

		const email = req.session.user;
		// const email = "a@gmail.com";

		let opt1 = selectFunction(
			"select * from ec_products where id = '"
			.concat(`${productId}`)
			.concat("' limit 10 offset 0")
		);

		request(opt1, (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					let opt2 = updateFunction(
						"update hCart SET quantity = '"
							.concat(`${quantity}`)
							.concat("' where product_id = '")
							.concat(`${productId}`)
							.concat("' AND email = '")
							.concat(`${email}`)
							.concat("'"),
						"select * from hCart where email = '"
							.concat(`${email}`)
							.concat("' limit 10 offset 0")
					);

					request(opt2, (error, response) => {
						if (error) throw new Error(error);
						else {
							let y = JSON.parse(response.body);

							// console.log(y);

							if (y.length >= 1) {
								return res.redirect("/v1/cart");
							}

							else {
								return res.redirect("/v1/cart");
							}
						}
					})
				}

				else {
					return res.redirect("/v1/cart");
				}
			}
		})
	}
	catch(error) {
		return res.redirect("/v1/cart");
	}
})

// isAuth
router.post("/v1/deleteCart", isAuth, async (req, res, next) => {
	try {
		const { productId } = req.body;

		// console.log(req.body);

		const email = req.session.user;
		// const email = "a@gmail.com";

		let opt1 = deleteFunction(
			"delete from hCart where product_id = '"
			.concat(`${productId}`)
			.concat("' AND email = '")
			.concat(`${email}`)
			.concat("'"),
			"select * from hCart where email = '"
			.concat(`${email}`)
			.concat("' limit 10 offset 0")
		);

		request(opt1, (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					return res.redirect("/v1/cart");
				}

				else {
					return res.redirect("/v1/cart");
				}
			}
		})
	}
	catch(error) {
		return res.redirect("/v1/cart");
	}
})

// isAuth
router.get("/v1/payments", isAuth, async (req, res, next) => {
	try {
		const email = req.session.user;
		// const email = "aabb@gmail.com";

		let opt1 = selectFunction(
			"select SUM(hCart.quantity * ec_products.price) AS totalPrice from hCart INNER JOIN ec_products ON hCart.product_id=ec_products.id WHERE email = '"
			.concat(`${email}`)
			.concat("'")
		);

		request(opt1, (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					return res.render("user/payment", {
						title: "Payments",
						total: x[0].totalPrice,
						email: email
					})
				}

				else {
					return res.redirect("/v1/cart");
				}
			}
		})
	}
	catch(error) {
		return res.redirect("/v1/cart");
	}
})

// isAuth
router.post("/v1/pay", isAuth, async (req, res, next) => {
	try {
		const { price, crypto } = req.body;

		// console.log(req.body);

		const email = req.session.user;
		// const email = 'aabb@gmail.com';

		let options = {
			'method': 'POST',
			'url': 'https://api-sandbox.nowpayments.io/v1/payment',
			'headers': {
			  'x-api-key': '5RBGE0W-0MTMWKD-KEHQK25-DX4Q6Q5',
			  'Content-Type': 'application/json'
			},
			body: JSON.stringify({
			  "price_amount": price,
			  "price_currency": 'eur',
			  "pay_currency": crypto,
			  "ipn_callback_url": `http://localhost:3000/v1/notify/?email=${email}&plan=1`,
			  "order_id": '0011',
				"case": "success"
			})
		};

		request(options, (error, response) => {
			if (error) throw new Error(error);
			else {
				let y = JSON.parse(response.body);

				// console.log(y);

				if (y.hasOwnProperty('code') && y.code === 'AMOUNT_MINIMAL_ERROR') {
					return res.json({
						isSuccess: false,
						address: '',
						amount: '',
						errorMessage: 'Change Crypto'
					})
				}

				else if (y.hasOwnProperty('payment_id')) {
					const uid = req.user.id;
					// const uid = 411;

					const totalPrice = y['price_amount'];

					const currentDate = new Date(y['created_at']);

					const subDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

					// console.log(subDate, uid, totalPrice);

					const values1 = `\'${uid}\', '${totalPrice}\', '0\', '0\', '${totalPrice}\', '${subDate}\', '${subDate}\'`;

					let opt4 = insertFunction(
						"insert into ec_orders(user_id, amount, shipping_amount, discount_amount, sub_total, created_at, updated_at) VALUES(" 
							.concat(`${values1}`)
							.concat(")"),
						"select * from ec_orders where user_id = '"
						  .concat(`${uid}`)
						  .concat("' limit 10 offset 0")
					);

					request(opt4, async (error, response) => {
						if (error) throw new Error(error);					 
						else {
							let z = JSON.parse(response.body);

							// console.log(z);

							if (z.length >= 1) {
								const currency = y['price_currency'].toUpperCase();

								const characters ='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

								function generateString() {
								  let result = ' ';
								  const charactersLength = characters.length;
								  for ( let i = 0; i < 10; i++ ) {
								    result += characters.charAt(Math.floor(Math.random() * charactersLength));
								  }

								  return result;
								}

								const chargeID = generateString();

								const orderId = z[z.length - 1].id;

								// console.log(orderId, chargeID);

								const values2 = `\'${currency}\', '0\', '${chargeID}\', 'bank_transfer\', '${totalPrice}\', '${orderId}\', 'pending\', 'confirm\', '${uid}\', '${subDate}\', '${subDate}\', 'Botble\Ecommerce\Models\Customer\'`;

								let opt5 = insertFunction(
									"insert into payments(currency, user_id, charge_id, payment_channel, amount, order_id, status, payment_type, customer_id, created_at, updated_at, customer_type) VALUES ("
										.concat(`${values2}`)
										.concat(")"),
									"select * from payments where customer_id = '"
									  .concat(`${uid}`)
									  .concat("' limit 10 offset 0")
								);

								request(opt5, async (error, response) => {
									if (error) throw new Error(error);					 
									else {
										let z1 = JSON.parse(response.body);

										// console.log(z1);

										if (z1.length >= 1) {
											const paymentId = z1[z1.length - 1].id;

											// console.log(paymentId);

											let opt6 = updateFunction(
												"update ec_orders set code = '#"
													.concat(`${10000+orderId}`)
													.concat("', payment_id = '")
													.concat(`${paymentId}`)
													.concat("' where id = '")
													.concat(`${orderId}`)
													.concat("'"),
												"select * from ec_orders where id = '"
													.concat(`${orderId}`)
													.concat("' limit 10 offset 0")
											);

											request(opt6, async (error, response) => {
												if (error) throw new Error(error);					 
												else {
													let z2 = JSON.parse(response.body);

													// console.log(z2);

													if (z2.length >= 1) {
														const address = y['pay_address'];

														// console.log(address);

														let iUrl = '';

														QRCode.toDataURL(address, function (err, url) {
														  if (err) {
														    // Handle any errors that may occur when generating the QR code
														    console.error(err);
																return res.redirect("/v1/cart");
														  } 
														  else {
														    iUrl = url;

														    // console.log(iUrl);

														    return res.render('user/cryptoQR', {
														      title: "PAYNOW",
														      lang: req.lang,
														      address: address,
														      amount: y.pay_amount,
														      currency: y.pay_currency,
														      cAmt: y.price_amount,
														      iSrc: iUrl
														    });
														  }
														})
													}

													else {
														return res.redirect("/v1/cart");
													}
												}
											})
										}

										else {
											return res.redirect("/v1/cart");
										}
									}
								})							
							}

							else {
								return res.redirect("/v1/cart");
							}
						}
					})

					// let opt3 = updateFunction(
					// 	"update ec_customers SET remember_token = '"
					// 		.concat(`${y['payment_id']}`)
					// 		.concat("' where email = '")
					// 		.concat(`${email}`)
					// 		.concat("'"),
					// 	"select * from ec_customers where email = '"
					// 		.concat(`${email}`)
					// 		.concat("' limit 10 offset 0")
					// );

					// request(opt3, async (error, response) => {
					//   if (error) throw new Error(error);
					//   else {
					//   	let z = JSON.parse(response.body);

					//   	// console.log(z);

					// 		if (z.length >= 1) {
					// 			const address = y.pay_address;
					// 			let iUrl = '';

					// 			QRCode.toDataURL(address, function (err, url) {
					// 			  if (err) {
					// 			    // Handle any errors that may occur when generating the QR code
					// 			    console.error(err);
					// 					return res.redirect("/v1/cart");
					// 			  } else {
					// 			    iUrl = url;

					// 			    // console.log(iUrl);

					// 			    return res.render('user/cryptoQR', {
					// 			      title: "PAYNOW",
					// 			      lang: req.lang,
					// 			      isAuth: true,
					// 			      cart: '9',
					// 			      address: address,
					// 			      amount: y.pay_amount,
					// 			      currency: y.pay_currency,
					// 			      cAmt: y.price_amount,
					// 			      iSrc: iUrl
					// 			    });
					// 			  }
					// 			})
					// 		}

					// 		else {
					// 			// return res.json({
					// 			// 	isSuccess: false,
					// 			// 	address: '',
					// 			// 	amount: '',
					// 			// 	errorMessage: 'failed...'
					// 			// })
					// 			return res.redirect("/v1/cart");
					// 		}
					// 	}
					// })
				}
				else {
					// return res.json({
					// 	isSuccess: false,
					// 	address: '',
					// 	amount: '',
					// 	errorMessage: 'failed...'
					// })
					return res.redirect("/v1/cart");
				}
			}
		});
	}

	catch(error) {
		console.log(error);
		return res.redirect("/v1/cart");
	}
})

router.get("/v1/getOrders", async (req, res, next) => {
	try {
		const uid = req.user.id;

		let isAuthenticated = false;

		(uid !== '' ? isAuthenticated = true : isAuthenticated = false);

		let opt1 = selectFunction(
			"select * from ec_orders where user_id = '"
				.concat(`${uid}`)
				.concat("'")
		);

		request(opt1, (error, response) => {
			if (error) throw new Error(error);
			else {
				let x = JSON.parse(response.body);

				// console.log(x);

				if (x.length >= 1) {
					return res.render("user/orders", 
						{
							title: "Orders",
							lang: req.lang,
							isAuth: isAuthenticated,
							cart: 0,
							products: x
						}
					)
				}

				else {
					return res.render("user/orders", 
						{
							title: "Orders",
							lang: req.lang,
							isAuth: isAuthenticated,
							cart: 0,
							products: []
						}
					)
				}
			}
		})
	}
	catch(error) {
		console.log(error);
		return res.redirect("/v1/cart");
	}
})

// router.post("/v1/postOrder", isAuth, async (req, res, next) => {
// 	try {
// 		const email = req.session.user;
// 		// const email = "hi@gmail.com";

// 		let opt1 = selectFunction(
// 			"select * from hCart where email = '"
// 			.concat(`${email}`)
// 			.concat("'")
// 		);

// 		request(opt1, async (error, response) => {
// 			if (error) throw new Error(error);
// 			else {
// 				let x = JSON.parse(response.body);

// 				// console.log(x);
// 				if (x.length >= 1) {
// 					const quantity = [];
// 					const product = [];

// 					function requestAsync(options) {
// 					  return new Promise((resolve, reject) => {
// 					    request(options, (error, response) => {
// 					      if (error) reject(error);
// 					      else resolve(response);
// 					    });
// 					  });
// 					}

// 					await Promise.all(
// 					    x.map(async (i) => {
// 						    const productId = i.product_id;
// 						    quantity.push({ pID: i.product_id, quantity: i.quantity });

// 						    let opt2 = selectFunction(
// 						        "select id,price from products where id = '"
// 						        .concat(`${productId}`)
// 						        .concat("'")
// 						    );

// 					      	try {
// 						        const response = await requestAsync(opt2);
// 						        // console.log("Response body:", response.body);

// 						        const y = JSON.parse(response.body);

// 						        // console.log(y);

// 						        if (y.length >= 1) {
// 							        product.push({ product: y });
// 							    }
// 					      	} catch (error) {
// 					      		// console.log(error);
// 					        	throw new Error(error);
// 					      	}
// 					    })
// 					);

// 	  			// console.log(quantity, product);

// 	  			const products = quantity.map(qtyItem => {
// 					  // Find the product that has the id matching pID from quantity array
// 					  const prodItem = product.find(
// 					    prod => prod.product[0].id === qtyItem.pID
// 					  );

// 					  // Check if a matching product was found
// 					  if (!prodItem) {
// 					    console.warn(`No product found for pID: ${qtyItem.pID}`);
// 					    return null;  // Or handle in another suitable manner
// 					  }

// 					  // Merge the found product and quantity item
// 					  return {
// 					    ...prodItem.product[0],
// 					    ...qtyItem
// 					  };
// 					}).filter(item => item !== null);

// 					// console.log(products);

// 					let totalPrice = 0;

// 					products.forEach(i => {
// 						totalPrice += parseFloat(i.price) * parseFloat(i.quantity);
// 					})

// 					// console.log(totalPrice);

// 					function random() {
// 				    let num = '';
// 				    for (let i = 0; i < 5; i++) {
// 				        num += Math.floor(Math.random() * 10);
// 				    }
// 				    return num;
// 					}

// 					const orderId = random();

// 					const values1 = `\'${email}\', '${orderId}\', '${totalPrice}\', 'null\'`;

// 					let opt3 = insertFunction(
// 					  "insert into hOrders (email, order_id, price, status) values(" 
// 					  	.concat(`${values1}`)
// 					  	.concat(")"),
// 						"select * from hOrders where email = '"
// 						  .concat(`${email}`)
// 						  .concat("'")
// 					);

// 					request(opt3, function (error, response) {
// 				  	if (error) throw new Error(error);
// 				  	else {
// 				  		let z = response.body;

// 				  		// console.log(z);

// 				  		if (z.length >= 1) {
// 				  			return res.redirect("/v1/payments");
// 				  		}

// 				  		else {
// 				  			return res.redirect("/v1/cart");
// 				  		}
// 				  	}
// 				  })
// 				}
// 			}
// 		})
// 	}

// 	catch(error) {
// 		return res.redirect("/v1/cart");
// 	}
// })

// router.get("/v1/status", async (req, res, next) => {
// 	try {
// 		// const email = req.session.user;
// 		const email = 'a@gmail.com';

// 		let opt1 = selectFunction(
// 			"select * from ec_customers where email = '"
// 			  .concat(`${email}`)
// 			  .concat("' limit 10 offset 0")
// 		);

// 		request(opt1, (error, response) => {
// 			if (error) throw new Error(error);
// 			else { 
// 				let y = JSON.parse(response.body);

// 				// console.log(y);

// 				if (y.length >= 1) {
// 					const id = y[0]['remember_token'];

// 					// console.log(id);

// 					if (id !== null) {
// 						const url = `https://api-sandbox.nowpayments.io/v1/payment/${id}`;

// 						const opt2 = {
// 						  'method': 'GET',
// 						  'url': url,
// 						  'headers': {
// 						   	'x-api-key': '5RBGE0W-0MTMWKD-KEHQK25-DX4Q6Q5'
// 						  }
// 						};

// 						request(opt2, function (error, response) {
// 							if (error) throw new Error(error);
// 							else {
// 								let x = JSON.parse(response.body); 
// 								// console.log(x);

// 								if (x.hasOwnProperty('payment_id')) {
// 									if (Number(x['payment_id']) === Number(id) && x['payment_status'] === 'finished') {
// 										// const currentDate = new Date();
// 										const currentDate = new Date(x['created_at']);
// 										// console.log(currentDate);

// 							      // Convert the date to a MySQL-compatible datetime string
// 							      const subDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');

// 							      console.log(subDate);

// 							      let opt3 = selectFunction(
// 											"select * from hCart where email = '"
// 											.concat(`${email}`)
// 											.concat("' limit 10 offset 0")
// 										);

// 										request(opt3, async (error, response) => {
// 											if (error) throw new Error(error);
// 											else {
// 												let z = JSON.parse(response.body);

// 												// console.log(z);

// 												if (z.length >= 1) {
// 													let opt4 = selectFunction(
// 														"select hCart.quantity, ec_products.price, ec_products.name, ec_products.image, ec_products.id from hCart INNER JOIN ec_products ON hCart.product_id=ec_products.id WHERE email = '"
// 														.concat(`${email}`)
// 														.concat("'")
// 													);

// 													request(opt4, async (error, response) => {
// 														if (error) throw new Error(error);
// 														else {
// 															let z1 = JSON.parse(response.body);

// 															// console.log(z1);

// 															if (z1.length >= 1) {
// 																const uid = y[0].id;
// 																const status = x['payment_status'];
// 																const pid = x['payment_id'];
// 																const totalPrice = 234.890;

// 																console.log(uid, status, pid);
// 																// user_id, amount, sp: 0, da:0, subtotal: amt, ca, ua

// 																const values1 = `\'null\', '${uid}\', 'null\', 'default\', '${status}\', '${totalPrice}\', 'null\', 'null\', 'null\', 'null\', 'null\', '${totalPrice}\', '0\', 'null\', 'null\', 'null\', 'null\', '${pid}\', 'null\', 'null\'`;

// 																let opt5 = insertFunction(
// 																	"insert into ec_orders(code, user_id, shipping_option, shipping_method, status, amount, tax_amount, shipping_amount, description, coupon_code, discount_amount, sub_total, is_confirmed, discount_description, is_finished, completed_at, token, payment_id, created_at, updated_at) VALUES(" 
// 																  	.concat(`${values1}`)
// 																  	.concat(")"),
// 																	"select * from ec_orders where user_id = '"
// 																	  .concat(`${uid}`)
// 																	  .concat("'")
// 																);

// 																console.log(opt5);

// 																request(opt5, function (error, response) {
// 																	if (error) throw new Error(error);
// 																	else { 
// 																		let z2 = JSON.parse(response.body); 

// 																		console.log(z2);

// 																		return res.send("/v1/oreders");
// 																	}
// 																})
// 															}

// 															else {
// 																return res.redirect("/v1/cart");
// 															}
// 														}
// 													})
// 												}

// 												else {
// 													return res.redirect("/v1/cart");
// 												}
// 											}
// 										})

// 							      return res.send("/v1/status");
// 							    }
// 								}

// 								else {
// 									return res.json({
// 										isSuccess: false,
// 										status: '',
// 										errorMessage: 'Failed...'
// 									})
// 								}
// 							}
// 						})
// 					}

// 					else {
// 						return res.json({
// 							isSuccess: false,
// 							status: '',
// 							errorMessage: 'You are not a subscriber...'
// 						})
// 					}
// 				}
// 			}
// 		})
// 	}

// 	catch(error) {
// 		console.log(error);
// 		return res.redirect("/v1/cart");
// 	}
// })

module.exports = router;