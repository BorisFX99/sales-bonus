
/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
  const {sale_price, quantity } = purchase;
   const discount = 1 - (purchase.discount / 100);
   return sale_price * quantity * discount;
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
  const bonusPercent = {
    0: 0.15,
    1: 0.1,
    2: 0.1,
  }
  if (index === total - 1) {
   return 0;
  }
  return seller.profit * (bonusPercent[index] ?? 0.05);
}

// @TODO: Расчет бонуса от позиции в рейтинге
/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {

  // @TODO: Проверка входных данных
  if (!data || Object.values(data).every(arr => !Array.isArray(arr) ||
   arr.length === 0)) {
  throw new Error('Data is not defined');
}
//Отдельная проверка для тестов "purchase_records"
if (!data.purchase_records || data.purchase_records.length === 0) {
    throw new Error('Purchase records is not defined');
  }

// @TODO: Проверка наличия опций
const { calculateRevenue, calculateBonus } = options;
if (!typeof calculateRevenue === "function" ||
  !typeof calculateBonus === "function") {
  throw new Error('Function are not defined!')
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

const sellerIndex = sellerStats.reduce((result, item) => {
  result[item.id] = item
  return result
}, {})

//Индексация товаров
const productIndex = data.products.reduce((result, item) => {
  result[item.sku] = item
  return result
}, {})

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
    const cost = product.purchase_price * item.quantity
    const revenue = calculateRevenue(item, product);
    const profit = revenue - cost;
    seller.profit += profit;

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
  const total = sellerStats.length;
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
