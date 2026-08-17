
// Контактні телефони компанії — єдине джерело правди.
// tel — машинний формат для посилань, display/displayFull — для відображення.
const phones = [
  {
    id: 1,
    tel: '+380989989828',
    display: '+38 098 998 9828',
    displayFull: '+38 (098) 998-98-28',
  },
  {
    id: 2,
    tel: '+380939989828',
    display: '+38 093 998 9828',
    displayFull: '+38 (093) 998-98-28',
  },
]

// Єдиний Viber-контакт компанії (одна іконка поруч з Telegram).
const viberLink = 'viber://chat?number=380989989828';

export { phones, viberLink };
export default phones;
