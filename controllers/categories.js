const express = require("express");
const Category = require("../models/cargory");
const Product = require("../models/product");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Error al cargar las categorías." });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada." });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Error al cargar la categoría." });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, parent_id } = req.body;

    if (!name) {
      return res
        .status(400)
        .json({ error: "Falta el nombre de la categoría." });
    }

    const category = new Category({
      name,
      slug: name.trim().toLowerCase().replace(/\s+/g, "-"),
      parent_id: parent_id || null,
    });

    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la categoría." });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const updateData = {};

    if (name) {
      updateData.name = name;
      updateData.slug = name.trim().toLowerCase().replace(/\s+/g, "-");
    }

    if (parent_id !== undefined) {
      updateData.parent_id = parent_id || null;
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada." });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Error al editar la categoría." });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const linkedProduct = await Product.findOne({ category_id: req.params.id });
    if (linkedProduct) {
      return res
        .status(400)
        .json({
          error: "No se puede eliminar una categoría con productos asociados.",
        });
    }

    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada." });
    }

    res.json({ message: "Categoría eliminada correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la categoría." });
  }
});

module.exports = router;
