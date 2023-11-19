import express from 'express';
import { PrismaClient } from '@prisma/client';
import { Product } from '../models/product.model.js';
import { PrismaClientValidationError } from '@prisma/client/runtime/library.js';

const prisma = new PrismaClient();
export const productRoutes = express.Router();

productRoutes.route('/products').get(async (req, res) => {
  try {
    // examplary body:
    // {
    //   "where": {
    //       "price": { "gt": 22 }
    //   },
    //   "orderBy": {
    //       "price": "desc"
    //   }
    // }
    const products: Product[] = req.body
      ? await prisma.product.findMany(req.body)
      : await prisma.product.findMany();
    res.status(200).send(products);
  } catch (error) {
    const retrievalError = error as PrismaClientValidationError;
    res.status(400).send({ error: retrievalError.message.split('\n').slice(-1)[0] });
  }
});

productRoutes.route('/products').post(async (req, res) => {
  const { name } = req.body;
  const products: Product[] = await prisma.product.findMany();

  if (products.find((product) => product.name === name)) {
    res.status(400).send({ error: 'Product already exists!' });
  } else {
    try {
      const product: Product = await prisma.product.create({ data: req.body });
      res.status(200).send(product);
    } catch (error) {
      const creationError = error as PrismaClientValidationError;
      res.status(400).send({ error: creationError.message.split('\n').slice(-1)[0] });
    }
  }
});

productRoutes.route('/products/:id').put(async (req, res) => {
  const id: string = req.params.id;
  const { name, description, measureUnit, price, amount } = req.body;

  try {
    const updatedProduct: Product = await prisma.product.update({
      where: { id },
      data: {
        ...({ name } ?? {}),
        ...({ description } ?? {}),
        ...({ measureUnit } ?? {}),
        ...({ price } ?? {}),
        ...({ amount } ?? {})
      }
    });
    res.status(200).send(updatedProduct);
  } catch (error) {
    const updateError = error as PrismaClientValidationError;
    res.status(400).send({ error: updateError.message.split('\n').slice(-1)[0] });
  }
});

productRoutes.route('/products/:id').delete(async (req, res) => {
  const id: string = req.params.id;

  try {
    const deletedProduct: Product = await prisma.product.delete({ where: { id } });
    res.status(200).send(deletedProduct);
  } catch (error) {
    const deleteError = error as PrismaClientValidationError;
    res.status(400).send({ error: deleteError.message.split('\n').slice(-1)[0] });
  }
});

// report
productRoutes.route('/product/:name').get(async (req, res) => {
  const productName: string = req.params.name;

  try {
    const productData = await prisma.product.findFirst({
      where: {
        name: productName
      },
      select: {
        name: true,
        amount: true,
        price: true
      }
    });

    if (productData) {
      // can't do it with prisma only
      const sum = productData.amount * productData.price;
      const productReport = { ...productData, sum };
      res.status(200).send(productReport);
    } else {
      res.status(404).send({ error: 'Product not found!' });
    }
  } catch (error) {
    const retrievalError = error as PrismaClientValidationError;
    res.status(400).send({ error: retrievalError.message.split('\n').slice(-1)[0] });
  }
});
