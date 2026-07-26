const express = require("express");
const Product = require("../models/Product");
const Category = require("../models/Category");
const { userExtractor, isAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().populate("category_id", "name slug");
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Error al cargar los productos." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "category_id",
      "name slug",
    );
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al cargar el producto." });
  }
});

router.post("/", userExtractor, isAdmin, async (req, res) => {
  try {
    const {
      sku,
      name,
      description,
      price,
      stock,
      available,
      categoryName,
      pictures,
      specs,
    } = req.body;

    if (!sku || !name || price === undefined || !categoryName) {
      return res
        .status(400)
        .json({
          error:
            "Faltan datos: sku, name, price y categoryName son obligatorios.",
        });
    }

    let category = await Category.findOne({ name: categoryName });

    if (!category) {
      category = new Category({
        name: categoryName,
        slug: categoryName.trim().toLowerCase().replace(/\s+/g, "-"),
      });
      await category.save();
    }

    const newProduct = new Product({
      sku,
      name,
      description,
      price,
      stock: stock || 0,
      available: available === undefined ? true : Boolean(available),
      category_id: category._id,
      pictures: Array.isArray(pictures) ? pictures : [],
      specs: specs || {},
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el producto." });
  }
});

router.put("/:id", userExtractor, isAdmin, async (req, res) => {
  try {
    const {
      sku,
      name,
      description,
      price,
      stock,
      available,
      categoryName,
      pictures,
      specs,
    } = req.body;
    const updateData = {};

    if (sku) updateData.sku = sku;
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (available !== undefined) updateData.available = Boolean(available);
    if (pictures !== undefined)
      updateData.pictures = Array.isArray(pictures) ? pictures : [];
    if (specs !== undefined) updateData.specs = specs || {};

    if (categoryName) {
      let category = await Category.findOne({ name: categoryName });
      if (!category) {
        category = new Category({
          name: categoryName,
          slug: categoryName.trim().toLowerCase().replace(/\s+/g, "-"),
        });
        await category.save();
      }
      updateData.category_id = category._id;
    }

    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al editar el producto." });
  }
});

router.delete("/:id", userExtractor, isAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    res.json({ message: "Producto eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto." });
  }
});

module.exports = router;
