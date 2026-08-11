// Importamos Express para manejar las rutas y los métodos del servidor web.
const express = require("express");
// Importamos los modelos de Mongoose para interactuar con la base de datos (Productos y Categorías).
const Product = require("../models/Product");
const Category = require("../models/Category");
// Importamos los middlewares de seguridad para verificar que el usuario ha iniciado sesión y es administrador.
const { userExtractor, isAdmin } = require("../middleware/auth");

const router = express.Router(); // Creamos un enrutador modular de Express.

// 1. Ruta para obtener la lista de todos los productos registrados en la tienda.
router.get("/", async (req, res) => {
  try {
    // Buscamos todos los productos y rellenamos la información de su categoría (nombre y slug) en lugar de mostrar solo un código ID.
    const products = await Product.find().populate("category_id", "name slug");
    res.json(products); // Devolvemos la lista completa en formato JSON.
  } catch (error) {
    // Si algo falla en la base de datos, respondemos con un error 500.
    res.status(500).json({ error: "Error al cargar los productos." });
  }
});

// 2. Ruta para buscar un producto específico usando su número de ID único.
router.get("/:id", async (req, res) => {
  try {
    // Buscamos el producto por ID y también incluimos los detalles de su categoría.
    const product = await Product.findById(req.params.id).populate(
      "category_id",
      "name slug",
    );
    // Si el producto no existe en la base de datos, devolvemos un error 404 (No encontrado).
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    res.json(product); // Devolvemos los datos del producto encontrado.
  } catch (error) {
    res.status(500).json({ error: "Error al cargar el producto." });
  }
});

// 3. Ruta para crear un producto nuevo (Protegida: solo accesible para usuarios autenticados que sean administradores).
router.post("/", userExtractor, isAdmin, async (req, res) => {
  try {
    // Extraemos todos los datos enviados desde el formulario del cliente.
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

    // Verificamos que los datos obligatorios no estén vacíos.
    if (!sku || !name || price === undefined || !categoryName) {
      return res
        .status(400)
        .json({
          error:
            "Faltan datos: sku, name, price y categoryName son obligatorios.",
        });
    }

    // Buscamos si la categoría ya existe en la base de datos por su nombre.
    let category = await Category.findOne({ name: categoryName });

    // Si la categoría no existe, la creamos automáticamente y la guardamos.
    if (!category) {
      category = new Category({
        name: categoryName,
        slug: categoryName.trim().toLowerCase().replace(/\s+/g, "-"), // Convertimos el nombre en un enlace amigable (slug).
      });
      await category.save();
    }

    // Creamos una nueva instancia del modelo Product con la información recibida.
    const newProduct = new Product({
      sku,
      name,
      description,
      price,
      stock: stock || 0,
      available: available === undefined ? true : Boolean(available),
      category_id: category._id, // Asociamos el ID de la categoría encontrada o creada.
      pictures: Array.isArray(pictures) ? pictures : [],
      specs: specs || {},
    });

    // Guardamos el nuevo producto en la base de datos y respondemos con un código 201 (Creado).
    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el producto." });
  }
});

// 4. Ruta para actualizar o editar un producto existente por su ID (Protegida: solo para administradores).
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
    const updateData = {}; // Objeto vacío para ir llenando únicamente con los datos que se van a modificar.

    // Verificamos qué campos sí fueron enviados para agregarlos al objeto de actualización.
    if (sku) updateData.sku = sku;
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = price;
    if (stock !== undefined) updateData.stock = stock;
    if (available !== undefined) updateData.available = Boolean(available);
    if (pictures !== undefined)
      updateData.pictures = Array.isArray(pictures) ? pictures : [];
    if (specs !== undefined) updateData.specs = specs || {};

    // Si también mandaron el nombre de la categoría, verificamos si existe o la creamos de igual forma.
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

    // Buscamos el producto por su ID, aplicamos los cambios y pedimos que nos devuelva el producto ya actualizado (new: true).
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    res.json(product); // Devolvemos el producto actualizado.
  } catch (error) {
    res.status(500).json({ error: "Error al editar el producto." });
  }
});

// 5. Ruta para eliminar un producto por su ID (Protegida: solo para administradores).
router.delete("/:id", userExtractor, isAdmin, async (req, res) => {
  try {
    // Buscamos el producto por ID y lo eliminamos de la base de datos de un solo golpe.
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    res.json({ message: "Producto eliminado correctamente." });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto." });
  }
});

// Exportamos el enrutador para que pueda ser utilizado en el archivo principal del servidor.
module.exports = router;