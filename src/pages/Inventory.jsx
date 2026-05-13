import Layout from "../components/Layout";
import { useState } from "react";
import "./Inventory.css";

export default function Inventory() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [products, setProducts] = useState([
    {
      id: 1,
      productName: "Coke",
      unitPrice: 10,
      sellingPrice: 15,
      quantity: 50,
      category: "Drinks",
    },
    {
      id: 2,
      productName: "Bread",
      unitPrice: 5,
      sellingPrice: 10,
      quantity: 20,
      category: "Food",
    },
    {
      id: 3,
      productName: "Noodles",
      unitPrice: 8,
      sellingPrice: 12,
      quantity: 35,
      category: "Food",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);

  const [newProduct, setNewProduct] = useState({
    productName: "",
    quantity: "",
    unitPrice: "",
    sellingPrice: "",
    category: "",
  });

  const handleChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value,
    });
  };

  const handleSaveProduct = () => {
    if (
      !newProduct.productName ||
      !newProduct.quantity ||
      !newProduct.unitPrice ||
      !newProduct.sellingPrice ||
      !newProduct.category
    ) {
      alert("Please fill all fields");
      return;
    }

    const formattedProduct = {
      ...newProduct,
      quantity: Number(newProduct.quantity),
      unitPrice: Number(newProduct.unitPrice),
      sellingPrice: Number(newProduct.sellingPrice),
    };

    if (isEdit) {
      setProducts(
        products.map((p) =>
          p.id === editId ? { ...p, ...formattedProduct } : p,
        ),
      );
    } else {
      setProducts([...products, { id: Date.now(), ...formattedProduct }]);
    }

    setShowAddModal(false);
    setIsEdit(false);

    setNewProduct({
      productName: "",
      quantity: "",
      unitPrice: "",
      sellingPrice: "",
      category: "",
    });
  };

  const handleDelete = (id) => {
    if (confirm("Delete this product?")) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  const handleEdit = (product) => {
    setIsEdit(true);
    setEditId(product.id);

    setNewProduct({
      productName: product.productName,
      quantity: product.quantity,
      unitPrice: product.unitPrice,
      sellingPrice: product.sellingPrice,
      category: product.category,
    });

    setShowAddModal(true);
  };

  const filtered = products.filter((p) => {
    const matchCategory = filter === "All" || p.category === filter;

    const matchSearch = p.productName
      .toLowerCase()
      .includes(search.toLowerCase());

    return matchCategory && matchSearch;
  });

  return (
    <Layout>
      <div className="inventory-container">
        {/* HEADER */}
        <div className="inventory-header">
          <h2>Inventory</h2>

          <div className="inventory-controls">
            <input
              type="text"
              placeholder="Search product..."
              className="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Food">Food</option>
              <option value="Drinks">Drinks</option>
            </select>

            <button
              className="add-btn"
              onClick={() => {
                setIsEdit(false);
                setNewProduct({
                  productName: "",
                  quantity: "",
                  unitPrice: "",
                  sellingPrice: "",
                  category: "Food",
                });
                setShowAddModal(true);
              }}
            >
              + Add Product
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="inventory-card">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Selling Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.productName}</td>
                  <td>{p.category}</td>
                  <td>₱{p.unitPrice}</td>
                  <td>₱{p.sellingPrice}</td>
                  <td>{p.quantity}</td>

                  <td className={p.quantity > 20 ? "available" : "low"}>
                    {p.quantity > 20 ? "Available" : "Low Stock"}
                  </td>

                  <td>
                    <button className="edit-btn" onClick={() => handleEdit(p)}>
                      Edit
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>{isEdit ? "Edit Product" : "Add Product"}</h3>

              {/* PRODUCT NAME */}
              <label>Product Name</label>
              <input
                type="text"
                name="productName"
                placeholder="Enter product name"
                value={newProduct.productName}
                onChange={handleChange}
              />

              {/* QUANTITY (STOCK) */}
              <label>Quantity (Stock)</label>
              <input
                type="number"
                name="quantity"
                placeholder="Enter stock quantity"
                value={newProduct.quantity}
                onChange={handleChange}
              />

              {/* UNIT PRICE */}
              <label>Unit Price</label>
              <input
                type="number"
                name="unitPrice"
                placeholder="Enter unit price"
                value={newProduct.unitPrice}
                onChange={handleChange}
              />

              {/* SELLING PRICE */}
              <label>Selling Price</label>
              <input
                type="number"
                name="sellingPrice"
                placeholder="Enter selling price"
                value={newProduct.sellingPrice}
                onChange={handleChange}
              />

              {/* CATEGORY */}
              <label>Category</label>
              <select
                name="category"
                value={newProduct.category}
                onChange={handleChange}
              >
                <option value="Food">Food</option>
                <option value="Drinks">Drinks</option>
              </select>

              <div className="modal-actions">
                <button onClick={() => setShowAddModal(false)}>Cancel</button>

                <button onClick={handleSaveProduct}>
                  {isEdit ? "Update" : "Add"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
