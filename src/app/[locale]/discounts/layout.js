import { buildAlternates } from '@/utils/seo';

// The discounts page itself is a client component ('use client') and cannot
// export metadata — this server layout supplies SEO metadata for the route.
export async function generateMetadata({ params }) {
  const { locale } = await params;
  const meta = {
    uk: {
      title: 'Знижки та акції',
      description: 'Знижки та акційні пропозиції AirbagAD на подушки безпеки, ремені та піропатрони. Доставка по Дніпру та Україні.',
    },
    ru: {
      title: 'Скидки и акции',
      description: 'Скидки и акционные предложения AirbagAD на подушки безопасности, ремни и пиропатроны. Доставка по всей Украине.',
    },
    en: {
      title: 'Discounts and deals',
      description: 'AirbagAD discounts and special offers on airbags, seat belts and pyrotechnics. Delivery across all Ukraine.',
    },
  };
  const m = meta[locale] || meta.ru;
  return {
    title: m.title,
    description: m.description,
    alternates: buildAlternates('discounts', locale),
  };
}

export default function DiscountsLayout({ children }) {
  return children;
}
