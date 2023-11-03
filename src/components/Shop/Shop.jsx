import React, { useEffect, useRef, useState } from "react";
import { FaSearch } from "react-icons/fa";
import {
  addToDb,
  deleteShoppingCart,
  getShoppingCart,
} from "../../utilities/fakedb";
import Cart from "../Cart/Cart";
import Product from "../Product/Product";
import "./Shop.css";
import { Link, useLoaderData } from "react-router-dom";

const Shop = () => {
  const [products, setProducts] = useState([]);

  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [itemPerpage, setItemsperPage] = useState(10);
  const [cart, setCart] = useState([]);
  const loaddata = useLoaderData();
  const [query, setquery] = useState("");
  const inputRef = useRef("");

  useEffect(() => {
    setCart(loaddata);
  }, [loaddata]);

  const numberOfpages = Math.ceil(count / itemPerpage);
  const pages = [...Array(numberOfpages).keys()];

  useEffect(() => {
    fetch(
      `http://localhost:5000/products?page=${currentPage}&limit=${itemPerpage}`
    )
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, [currentPage, itemPerpage]);

  useEffect(() => {
    fetch("http://localhost:5000/productsCount")
      .then((res) => res.json())
      .then((data) => setCount(data.count));
  }, []);

  const handleAddToCart = (product) => {
    let newCart = [];
    const exists = cart.find((pd) => pd._id === product._id);
    if (!exists) {
      product.quantity = 1;
      newCart = [...cart, product];
    } else {
      exists.quantity = exists.quantity + 1;
      const remaining = cart.filter((pd) => pd._id !== product._id);
      newCart = [...remaining, exists];
    }

    setCart(newCart);
    addToDb(product._id);
  };

  const handleClearCart = () => {
    setCart([]);
    deleteShoppingCart();
  };

  const handleitemperpage = (e) => {
    const value = parseInt(e.target.value);
    setItemsperPage(value);
    setCurrentPage(0);
  };

  const handlePrev = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };
  console.log(query);

  const handleSearch = async () => {
    const response = await fetch("http://localhost:5000/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });
    if (response.ok) {
      const data = await response.json();
      setProducts(data);
    }
  };

  return (
    <div>
      <div className="search">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Seach Here ..."
            value={query}
            onChange={(e) => setquery(e.target.value)}
          />
          <button onClick={handleSearch} id="search-icon">
            <FaSearch></FaSearch>
          </button>
        </div>
      </div>
      <div className="shop-container">
        <div className="products-container">
          {products.map((product) => (
            <Product
              key={product._id}
              product={product}
              handleAddToCart={handleAddToCart}
            ></Product>
          ))}
        </div>
        <div className="cart-container">
          <Cart cart={cart} handleClearCart={handleClearCart}>
            <Link className="proceed-link" to="/orders">
              <button className="btn-proceed">Review Order</button>
            </Link>
          </Cart>
        </div>
        <div className="pagination">
          <p>currentPage: {currentPage}</p>
          <button onClick={handlePrev} disabled={currentPage === 0}>
            Prev
          </button>
          {pages.map((page) => (
            <button
              className={currentPage === page ? "selected" : ""}
              key={page}
              onClick={() => {
                setCurrentPage(page);
              }}
            >
              {page + 1}
            </button>
          ))}
          <button
            onClick={handleNext}
            disabled={currentPage === pages.length - 1}
          >
            Next
          </button>
          <select
            name=""
            value={itemPerpage}
            onChange={handleitemperpage}
            id=""
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="40">40</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Shop;
