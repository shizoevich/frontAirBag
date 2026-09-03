/**
 * Отправка квитанции об оплате с повторной попыткой.
 *
 * Документ грузится отдельным запросом уже после создания заказа — раньше он
 * туда попасть не может, нужен id. Ошибка этого запроса раньше уходила в
 * console.warn как «non-blocking», и клиент о ней не узнавал: заказ создан, а
 * квитанции к нему нет. Пока существовал путь через бота, документ можно было
 * донести оттуда; после его удаления это единственный способ.
 *
 * @param {(args: {orderId: number, file: File}) => Promise<unknown>} upload
 * @returns {Promise<boolean>} удалось ли отправить
 */
export async function uploadPaymentDocWithRetry(upload, orderId, file, attempts = 2) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await upload({ orderId, file });
      return true;
    } catch (uploadErr) {
      console.warn(
        `Payment document upload failed (attempt ${attempt}/${attempts}):`,
        uploadErr
      );
    }
  }
  return false;
}
