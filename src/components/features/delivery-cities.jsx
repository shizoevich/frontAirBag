import { UA_CITIES } from '@/utils/seo';

// Visible "delivery geography" block — user-facing content that also helps the site
// surface for city-specific queries. This is the legitimate alternative to hidden
// keyword stuffing: the cities are real delivery destinations, shown to visitors.
const COPY = {
  uk: {
    title: 'Доставка по всій Україні',
    lead: 'Надсилаємо подушки безпеки, ремені безпеки та піропатрони у всі міста України:',
    note: 'Оформлення онлайн, відправлення Новою Поштою по всій країні.',
  },
  ru: {
    title: 'Доставка по всей Украине',
    lead: 'Отправляем подушки безопасности, ремни безопасности и пиропатроны во все города Украины:',
    note: 'Оформление онлайн, отправка Новой Почтой по всей стране.',
  },
  en: {
    title: 'Delivery across all Ukraine',
    lead: 'We ship airbags, seat belts and pyrotechnics to every city in Ukraine:',
    note: 'Order online, delivered by Nova Poshta nationwide.',
  },
};

export default function DeliveryCities({ locale = 'ru' }) {
  const copy = COPY[locale] || COPY.ru;
  const cities = UA_CITIES[locale] || UA_CITIES.ru;

  return (
    <section className="tp-delivery-cities-area pt-45 pb-45" style={{ backgroundColor: '#F4F7F9' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-11 text-center">
            <h2 className="tp-section-title" style={{ fontSize: '26px', marginBottom: '14px' }}>
              {copy.title}
            </h2>
            <p style={{ marginBottom: '12px' }}>{copy.lead}</p>
            <p style={{ color: '#55585b', lineHeight: 2, marginBottom: '10px' }}>
              {cities.join(' · ')}
            </p>
            <p style={{ color: '#7a7f83', fontSize: '14px', marginBottom: 0 }}>{copy.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
