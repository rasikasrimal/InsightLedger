import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import Category from '../models/Category';
import { AuthRequest } from '../types';

export const createCategoryValidation = [
  body('name').trim().notEmpty(),
  body('type').isIn(['income', 'expense']),
  body('icon').optional().trim(),
  body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/)
];

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { name, type, icon, color } = req.body;
    const userId = req.user?.userId;

    const category = new Category({
      name,
      type,
      icon,
      color,
      userId
    });

    await category.save();
    res.status(201).json(category);
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ error: 'Category with this name already exists' });
      return;
    }
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { type } = req.query;

    const filter: any = { userId };
    if (type) filter.type = type;

    const categories = await Category.find(filter).sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

export const getCategoryById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const category = await Category.findOne({ _id: id, userId });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Failed to fetch category' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.userId;
    const { id } = req.params;
    const { name, type, icon, color } = req.body;

    const category = await Category.findOneAndUpdate(
      { _id: id, userId },
      { name, type, icon, color },
      { new: true, runValidators: true }
    );

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json(category);
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    const category = await Category.findOneAndDelete({ _id: id, userId });

    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
};
