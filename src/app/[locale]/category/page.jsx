import { redirect } from "next/navigation";

// There is no "all categories" page any more: the catalog with every category level
// lives on the home page, so a bare /category/ just goes there.
export default async function CategoryPage({ params }) {
  const { locale } = await params;
  redirect(`/${locale}`);
}
