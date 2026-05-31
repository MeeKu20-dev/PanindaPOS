import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "./Inventory.css";

export default function Inventory() {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [products, setProducts] = useState([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [errors, setErrors] = useState({});

  const [pendingAction, setPendingAction] = useState(null);

  const [newProduct, setNewProduct] = useState({
    productName: "",
    quantity: "",
    unitPrice: "",
    sellingPrice: "",
    category: "",
  });

  // LOAD PRODUCTS
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        console.log(error);
        return;
      }

      const formatted = (data || []).map((item) => ({
        id: item.id,
        productName: item.product_name,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        sellingPrice: item.selling_price,
        earningPerItem: Number(item.selling_price) - Number(item.unit_price),
        category: item.category,
      }));

      setProducts(formatted);
    };

    load();
  }, []);

  const handleChange = (e) => {
    setNewProduct({
      ...newProduct,
      [e.target.name]: e.target.value,
    });
  };

  // OPEN SAVE CONFIRM
  const handleSaveProduct = () => {
    let newErrors = {};

    if (!newProduct.productName.trim()) {
      newErrors.productName = "Product name is required";
    }

    if (!newProduct.quantity) {
      newErrors.quantity = "Quantity is required";
    }

    if (!newProduct.unitPrice) {
      newErrors.unitPrice = "Unit price is required";
    }

    if (!newProduct.sellingPrice) {
      newErrors.sellingPrice = "Selling price is required";
    }

    if (!newProduct.category) {
      newErrors.category = "Category is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});

    setPendingAction({
      isEdit,
      editId,
      product: newProduct,
    });
    setShowAddModal(false);
    setShowConfirm(true);
  };

  // CONFIRM SAVE (ADD / EDIT)
  const confirmSave = async () => {
    const p = pendingAction.product;

    const payload = {
      product_name: p.productName,
      quantity: Number(p.quantity),
      unit_price: Number(p.unitPrice),
      selling_price: Number(p.sellingPrice),
      category: p.category,
    };

    if (pendingAction.isEdit) {
      await supabase
        .from("products")
        .update(payload)
        .eq("id", pendingAction.editId);
    } else {
      await supabase.from("products").insert([payload]);
    }

    setShowConfirm(false);
    setShowAddModal(false);
    setIsEdit(false);
    setPendingAction(null);

    setNewProduct({
      productName: "",
      quantity: "",
      unitPrice: "",
      sellingPrice: "",
      category: "",
    });

    // refresh
    const { data } = await supabase.from("products").select("*");

    const formatted = (data || []).map((item) => ({
      id: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      sellingPrice: item.selling_price,
      earningPerItem: item.selling_price - item.unit_price,
      category: item.category,
    }));

    setProducts(formatted);
  };

  // OPEN DELETE MODAL
  const openDeleteConfirm = (id) => {
    setDeleteId(id);
    setShowDeleteConfirm(true);
  };

  // CONFIRM DELETE
  const handleDelete = async () => {
    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", deleteId);

    if (error) {
      console.log(error);
      return;
    }

    setShowDeleteConfirm(false);
    setDeleteId(null);

    // refresh
    const { data } = await supabase.from("products").select("*");

    const formatted = (data || []).map((item) => ({
      id: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      unitPrice: item.unit_price,
      sellingPrice: item.selling_price,
      earningPerItem: item.selling_price - item.unit_price,
      category: item.category,
    }));

    setProducts(formatted);
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
            <option value="Drinks">Drinks</option>
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
              <th>Earning / Item</th>
              <th>Stock</th>

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
                <td style={{ color: "#2e7d32", fontWeight: "bold" }}>
                  ₱{p.earningPerItem}
                </td>
                <td>{p.quantity}</td>

                <td>
                  <button className="edit-btn" onClick={() => handleEdit(p)}>
                    Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => openDeleteConfirm(p.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* SAVE MODAL */}
      {showConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Save</h3>

            <p style={{ marginTop: "10px", color: "#555" }}>
              Do you want to proceed with this action?
            </p>

            <div className="modal-actions">
              <button onClick={() => setShowConfirm(false)}>Cancel</button>

              <button onClick={confirmSave}>Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Delete Product</h3>

            <p style={{ marginTop: "10px", color: "#555" }}>
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>

            <div className="modal-actions">
              <button onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>

              <button
                onClick={handleDelete}
                style={{ background: "#e74c3c", color: "white" }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{isEdit ? "Edit Product" : "Add Product"}</h3>

            <label>Product Name</label>
            <input
              type="text"
              name="productName"
              value={newProduct.productName}
              onChange={handleChange}
            />
            {errors.productName && (
              <p className="error-text">{errors.productName}</p>
            )}

            <label>Quantity</label>
            <input
              type="number"
              name="quantity"
              value={newProduct.quantity}
              onChange={handleChange}
            />
            {errors.quantity && <p className="error-text">{errors.quantity}</p>}

            <label>Unit Price</label>
            <input
              type="number"
              name="unitPrice"
              value={newProduct.unitPrice}
              onChange={handleChange}
            />
            {errors.unitPrice && (
              <p className="error-text">{errors.unitPrice}</p>
            )}

            <label>Selling Price</label>
            <input
              type="number"
              name="sellingPrice"
              value={newProduct.sellingPrice}
              onChange={handleChange}
            />
            {errors.sellingPrice && (
              <p className="error-text">{errors.sellingPrice}</p>
            )}

            <label>Category</label>
            <select
              name="category"
              value={newProduct.category}
              onChange={handleChange}
            >
              <option value="Food">Food</option>
              <option value="Drinks">Drinks</option>
            </select>

            {errors.category && <p className="error-text">{errors.category}</p>}

            <div className="modal-actions">
              <button
                onClick={() => {
                  setShowAddModal(false);

                  setErrors({
                    productName: "",
                    quantity: "",
                    unitPrice: "",
                    sellingPrice: "",
                    category: "",
                  });

                  setNewProduct({
                    productName: "",
                    quantity: "",
                    unitPrice: "",
                    sellingPrice: "",
                    category: "Food",
                  });
                }}
              >
                Cancel
              </button>

              <button onClick={handleSaveProduct}>
                {isEdit ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
