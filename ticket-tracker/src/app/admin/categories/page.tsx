import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/guards';
import CategoryForm from './CategoryForm';
import { CategoryRow } from './CategoryRow';

export const metadata = { title: 'Categories | Ticket Tracker' };

export default async function CategoriesPage() {
  await requireAdmin();

  const categories = await prisma.category.findMany({ orderBy: { createdAt: 'asc' } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-zinc-900">Categories</h1>

      <CategoryForm />

      {categories.length > 0 && (
        <table className="mt-8 w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-zinc-500">
              <th className="py-2 pr-4 font-medium">Name</th>
              <th className="py-2 pr-4 font-medium">Status</th>
              <th className="py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <CategoryRow key={`${cat.id}-${cat.name}`} category={cat} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
