
/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  const { discount, sale_price, quantity } = purchase;
  const cost = _product.purchase_price * quantity;
  return (sale_price * quantity * (1 - discount / 100)) - cost;
}
// @TODO: Расчет выручки от операции

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  const { profit } = seller;
  // const totalProfit = total;
  const bonusPercent = {
    0: 0.15,
    1: 0.1,
    2: 0.1,
    [total]: 0,
  }
  const rate = bonusPercent[index] ?? 0.05;
  return seller.bonus = rate * profit;
}
// switch (index) {
//   case 0 :
//     return seller.bonus = 0.15 * profit
//   break;
//   case 1 :
//   case 2 :
//     return seller.bonus = 0.1 * profit
//   break;
//   case total :
//     return seller.bonus = 1 * profit
//   break;
//   default :
//   return seller.bonus = 0.5 * profit
// }

// @TODO: Расчет бонуса от позиции в рейтинге


/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {

  // @TODO: Проверка входных данных
  if (!data)
    throw new Error('Некорректные входные данные');

  const arrVal = Object.keys(data);
  for (const key of arrVal) {
    if (!Array.isArray(data[key]) || data[key].length === 0)
      throw new Error('Некорректные элементы объекта data!');
  }

  // @TODO: Проверка наличия опций
  const { calculateRevenue, calculateBonus } = options;
  if (!calculateRevenue || !calculateBonus) {
    throw new Error('Переменная не опредлена!')
  }
  if (!typeof calculateRevenue === "function" || !typeof calculateBonus === "function") {
    throw new Error('Функция не опредлена!')
  }

  // @TODO: Подготовка промежуточных данных для сбора статистики
  const sellerStats =
    data.sellers.map(seller => ({
      id: seller.id,
      name: `${seller.first_name} ${seller.last_name}`,
      revenue: 0,
      profit: 0,
      sales_count: 0,
      products_sold: {},
      bonus: 0,
    })
    );

  // @TODO: Индексация продавцов и товаров для быстрого доступа
  //Индексация продавцов
  function groupBy(array, fnKey) {
    return array.reduce((acc, item) => {
      const key = fnKey(item)
      acc[key] = item;
      return acc;
    }, {})
  }

  const sellerIndex = groupBy(sellerStats, seller =>
    seller.id);

  //Индексация товаров

  const productIndex = groupBy(data.products, product =>
    product.sku);

  // @TODO: Расчет выручки и прибыли для каждого продавца
  //Добавьте двойной цикл перебора чеков и покупок в них
  // Переберите все записи о продажах.
  // Обновите статистику в объекте для каждого продавца (запись из sellerStats).
  data.purchase_records.forEach(record => {
    const seller = sellerIndex[record.seller_id];
    seller.sales_count++;
    seller.revenue += record.total_amount;

    record.items.forEach(item => {
      const product = productIndex[item.sku];
      seller.profit += calculateRevenue(item, productIndex[item.sku])

      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0
      }

      seller.products_sold[item.sku] += item.quantity
    })
  });

  // @TODO: Сортировка продавцов по прибыли

  sellerStats.sort((a, b) => b.profit - a.profit
  )

  // @TODO: Назначение премий на основе ранжирования
  sellerStats.forEach((seller, index) => {
    const total = sellerStats.length - 1;
    seller.bonus = calculateBonus(index, total, seller)
    seller.top_products = (Object.entries(seller.products_sold)
      .sort((a, b) => b[1] - a[1]))
      .slice(0, 10)
      .map(([name, value]) =>
        ({ [name]: value })
      )
  }
  )
  // @TODO: Подготовка итоговой коллекции с нужными полями
   const result = sellerStats.map(seller => ({
    seller_id: seller.id,
    name: seller.name,
    revenue: +((seller.revenue).toFixed(2)),
    profit: +((seller.profit).toFixed(2)),
    sales_count: seller.sales_count,
    top_products: seller.top_products,
    bonus: +((seller.bonus).toFixed(2)),
    })
  )
  return result;
}



// Вычесть скидку из цены, чтобы получить выручку.
// Вычислить прибыль как разницу выручки и затрат.
// Умножить на заданный процент бонуса и вернуть.

// В функциях с более чем десятью строками эти шаги есть почти всегда:
// Проверить переданные данные.
// Проверить нужные для работы настройки/опции/зависимости.
// Собрать промежуточные данные.
// Выполнить основные действия.
// Сформировать итоговый ответ.
// Рекомендуем запомнить последовательность шагов: это пригодится в будущем.