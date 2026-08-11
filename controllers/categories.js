// Importamos Express para manejar las rutas y los métodos del servidor web.
const express = require("express");
// Importamos los modelos de Mongoose para interactuar con la base de datos (Categorías y Productos).
const Category = require("../models/Category");
const Product = require("../models/Product");

const router = express.Router(); // Creamos un enrutador modular de Express.

// 1. Ruta para obtener la lista de todas las categorías registradas.
router.get("/", async (req, res) => {
  try {
    // Buscamos todas las categorías en la base de datos.
    const categories = await Category.find();
    res.json(categories); // Devolvemos la lista completa en formato JSON.
  } catch (error) {
    // Si ocurre un error al cargar, respondemos con un código 500 (Error del servidor).
    res.status(500).json({ error: "Error al cargar las categorías." });
  }
});

// 2. Ruta para buscar una categoría específica usando su número de ID único.
router.get("/:id", async (req, res) => {
  try {
    // Buscamos la categoría por su ID en Mongoose.
    const category = await Category.findById(req.params.id);
    
    // Si la categoría no existe, devolvemos un error 404 (No encontrada).
    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada." });
    }
    
    res.json(category); // Devolvemos los datos de la categoría encontrada.
  } catch (error) {
    res.status(500).json({ error: "Error al cargar la categoría." });
  }
});

// 3. Ruta para crear una nueva categoría.
router.post("/", async (req, res) => {
  try {
    // Extraemos el nombre y la categoría padre (si tiene) desde el cuerpo de la petición.
    const { name, parent_id } = req.body;

    // Verificamos que el nombre no esté vacío.
    if (!name) {
      return res
        .status(400)
        .json({ error: "Falta el nombre de la categoría." });
    }

    // Creamos una nueva instancia del modelo Category con su nombre, slug amigable y categoría padre opcional.
    //Trim() elimina espacios al inicio y al final, toLowerCase() convierte a minúsculas, y replace() reemplaza espacios por guiones.
    const category = new Category({
      name,
      slug: name.trim().toLowerCase().replace(/\s+/g, "-"), // Convertimos el nombre en un enlace amigable (slug).
      parent_id: parent_id || null,
    });

    // Guardamos la nueva categoría en la base de datos y respondemos con un código 201 (Creado).
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ error: "Error al crear la categoría." });
  }
});

// 4. Ruta para actualizar o editar una categoría existente por su ID.
router.put("/:id", async (req, res) => {
  try {
    const { name, parent_id } = req.body;
    const updateData = {}; // Objeto vacío para almacenar únicamente los campos que se van a modificar.

    // Si enviaron un nuevo nombre, lo actualizamos y generamos su nuevo slug correspondiente.
    if (name) {
      updateData.name = name;
      updateData.slug = name.trim().toLowerCase().replace(/\s+/g, "-");
    }

    // Si enviaron información sobre la categoría padre, la actualizamos.
    if (parent_id !== undefined) {
      updateData.parent_id = parent_id || null;
    }

    // Buscamos la categoría por ID, aplicamos los cambios y pedimos que devuelva la categoría ya actualizada (new: true).
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    // Si la categoría no existe, devolvemos un error 404.
    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada." });
    }

    res.json(category); // Devolvemos la categoría con los cambios aplicados.
  } catch (error) {
    res.status(500).json({ error: "Error al editar la categoría." });
  }
});

// 5. Ruta para eliminar una categoría por su ID.
router.delete("/:id", async (req, res) => {
  try {
    // Verificamos primero si hay algún producto vinculado a esta categoría antes de borrarla.
    const linkedProduct = await Product.findOne({ category_id: req.params.id });
    
    // Si encontramos productos asociados, bloqueamos la eliminación y enviamos un error 400.
    if (linkedProduct) {
      return res
        .status(400)
        .json({
          error: "No se puede eliminar una categoría con productos asociados.",
        });
    }

    // Si no hay productos vinculados, procedemos a buscar y eliminar la categoría de la base de datos.
    const category = await Category.findByIdAndDelete(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: "Categoría no encontrada." });
    }

    res.json({ message: "Categoría eliminada correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar la categoría." });
  }
});

// Exportamos el enrutador para que pueda ser utilizado en el archivo principal del servidor.
module.exports = router;