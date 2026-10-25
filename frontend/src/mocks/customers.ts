import type { Customer, FinancialStatus, FulfillmentStatus, OrderStatus, ShippingAddress, ShopifyOrder } from '@/types'
import { daysAgo } from './time'

type ItemSeed = [title: string, variant: string, price: number, qty?: number]
type OrderSeed = Omit<ShopifyOrder, 'shippingAddress'>

const IMAGES: [RegExp, string][] = [[/fedora/i, 'wool-fedora'], [/panama|straw/i, 'straw-panama'], [/trucker/i, 'trucker-hat'], [/flat cap|newsboy/i, 'flat-cap'], [/cowboy/i, 'cowboy-hat'], [/bucket/i, 'bucket-hat'], [/wide brim|cloche/i, 'cloche'], [/beanie/i, 'beanie']]
const imageFor = (title: string) => `/images/products/${IMAGES.find(([r]) => r.test(title))?.[1] ?? 'wool-fedora'}.jpg`
const FULFILL: Record<OrderStatus, FulfillmentStatus> = { unfulfilled: 'unfulfilled', in_transit: 'in_transit', delivered: 'delivered', returned: 'delivered', cancelled: 'unfulfilled' }

function order(num: number, status: OrderStatus, ageDays: number, items: ItemSeed[], carrier = 'UPS', financial?: FinancialStatus): OrderSeed {
  const shipped = status === 'in_transit' || status === 'delivered' || status === 'returned'
  const tracking = shipped ? `1Z${num}${(num * 7919).toString(36).toUpperCase()}` : null
  const lineItems = items.map(([title, variant, price, quantity = 1], i) => ({ sku: `GB-${num}-${i + 1}`, title, variant, price, quantity, image: imageFor(title) }))
  return {
    id: `order-${num}`,
    number: `#GB${num}`,
    status,
    financialStatus: financial ?? (status === 'returned' || status === 'cancelled' ? 'refunded' : status === 'unfulfilled' ? 'pending' : 'paid'),
    fulfillmentStatus: FULFILL[status],
    total: Math.round(lineItems.reduce((s, li) => s + li.price * li.quantity, 0) * 100) / 100,
    currency: 'USD',
    createdAt: daysAgo(ageDays),
    carrier: shipped ? carrier : null,
    trackingNumber: tracking,
    trackingUrl: tracking ? `https://tracking.example.com/${carrier.toLowerCase()}/${tracking}` : null,
    lineItems,
    adminUrl: `https://admin.shopify.com/store/goorin/orders/${num}`,
  }
}

type CustomerSeed = [id: string, name: string, email: string, location: string, sinceDays: number, orders: OrderSeed[], note?: string]

const seeds: CustomerSeed[] = [
  ['c01', 'Margaret Okonkwo', 'margaret.okonkwo@example.com', 'Brooklyn, NY', 900, [
    order(20398, 'delivered', 4, [['Hampton Wool Fedora', 'Tobacco / M', 148]]),
    order(20211, 'delivered', 30, [['Watkins Straw Panama', 'Natural / M', 128]], 'USPS'),
    order(19790, 'delivered', 160, [['Dulles Newsboy', 'Grey Tweed / M', 78], ['Sage Bucket Hat', 'Olive / M', 58, 2]], 'UPS', 'partially_refunded'),
  ], 'Long-time customer since 2023. Prefers email.'],
  ['c02', 'Lena Fischer', 'lena.fischer@example.com', 'Portland, OR', 210, [order(20190, 'delivered', 25, [['Mae Wide Brim', 'Charcoal / S', 138]])]],
  ['c03', 'Marcus Bell', 'marcus@bellandbrim.example.com', 'Austin, TX', 640, [
    order(20150, 'delivered', 40, [['The Rooster Trucker', 'Black / One size', 27, 24], ['The Panther Trucker', 'Black / One size', 27, 24]], 'FedEx'),
  ], 'Owner of Bell & Brim boutique. Wholesale account WS-118, net-30.'],
  ['c04', 'Theo Ramirez', 'theo.ramirez@example.com', 'San Diego, CA', 120, [
    order(20402, 'delivered', 2, [['Cuba Cowboy', 'Sand / M', 165]]),
    order(20302, 'delivered', 12, [['Bushwick Flat Cap', 'Olive / M', 68]], 'USPS'),
  ]],
  ['c05', 'Hannah Whitlock', 'hannah.w@example.com', 'Nashville, TN', 480, [
    order(20366, 'delivered', 6, [['Dulles Newsboy', 'Grey Tweed / L', 78]]),
    order(20330, 'delivered', 5, [['Sage Bucket Hat', 'Olive / M', 58]], 'USPS'),
    order(19980, 'delivered', 52, [['Ridgeway Felt Fedora', 'Black / L', 175]]),
  ]],
  ['c06', 'Dev Patel', 'dev.patel@example.com', 'Chicago, IL', 300, [
    order(20411, 'in_transit', 3, [['The Panther Trucker', 'Black / One size', 45], ['Bushwick Flat Cap', 'Charcoal / L', 68]]),
    order(20340, 'in_transit', 9, [['Hampton Wool Fedora', 'Black / L', 148]], 'FedEx'),
  ]],
  ['c07', 'Rosa Delgado', 'rosa.delgado@example.com', 'Santa Fe, NM', 1100, [order(20177, 'delivered', 35, [['Watkins Straw Panama', 'Natural / S', 128]])], 'Collector. Owns several vintage Goorin pieces.'],
  ['c08', 'Jonah Abernathy', 'jonah.abernathy@example.com', 'Savannah, GA', 400, [order(20120, 'delivered', 60, [['Ridgeway Felt Fedora', 'Chocolate / M', 175]])]],
  ['c09', 'Keiko Tanaka', 'keiko.tanaka@example.com', 'Seattle, WA', 90, [order(20260, 'delivered', 8, [['Mae Wide Brim', 'Camel / S', 138]])]],
  ['c10', 'Oliver Grant', 'oliver.grant@example.ca', 'Toronto, ON', 14, []],
  ['c11', 'Imogen Clarke', 'imogen.clarke@example.co.uk', 'London, UK', 260, [
    order(20388, 'unfulfilled', 3, [['Hampton Wool Fedora', 'Camel / S', 148]]),
    order(20015, 'delivered', 45, [['Dulles Newsboy', 'Herringbone / S', 78]], 'DHL'),
  ]],
  ['c12', 'Samuel Adeyemi', 'samuel.adeyemi@example.com', 'Atlanta, GA', 330, [order(20355, 'returned', 18, [['Cuba Cowboy', 'Chocolate / L', 165]])]],
  ['c13', 'Clara Bianchi', 'clara.bianchi@example.com', 'San Francisco, CA', 520, [
    order(20360, 'returned', 14, [['Ridgeway Felt Fedora', 'Black / M', 175], ['Hampton Wool Fedora', 'Grey / M', 148], ['Watkins Straw Panama', 'Natural / M', 128]], 'UPS', 'partially_refunded'),
  ]],
  ['c14', 'Wesley Hart', 'wes@hartlinepictures.example.com', 'Los Angeles, CA', 75, [order(20240, 'delivered', 20, [['Dulles Newsboy', 'Grey Tweed / M', 62, 36]], 'FedEx')], 'Costume buyer, Hartline Pictures.'],
  ['c15', 'Nora Lindqvist', 'nora.lindqvist@example.com', 'Minneapolis, MN', 610, [order(20280, 'delivered', 22, [['Bushwick Flat Cap', 'Charcoal / L', 68]])]],
  ['c16', 'Felix Moreau', 'felix.moreau@example.com', 'New Orleans, LA', 700, [order(20230, 'delivered', 18, [['Ridgeway Felt Fedora', 'Burgundy / M', 175]])]],
  ['c17', 'Amara Nwosu', 'amara.nwosu@example.com', 'Denver, CO', 150, [order(20310, 'delivered', 15, [['Sage Bucket Hat', 'Sand / S', 58]], 'USPS')]],
  ['c18', 'Grace Kowalski', 'grace.kowalski@example.com', 'Pittsburgh, PA', 380, [
    order(20395, 'delivered', 3, [['Bushwick Flat Cap', 'Olive / M', 68]], 'USPS'),
    order(20275, 'delivered', 20, [['The Rooster Trucker', 'Brown / One size', 45]]),
  ]],
  ['c19', 'Ruth Calloway', 'ruth@fieldandhearth.example.com', 'Boston, MA', 4, [], 'Editor, Field & Hearth Magazine.'],
  ['c20', 'Peter Vance', 'peter.vance@example.com', 'Phoenix, AZ', 200, [order(19870, 'delivered', 62, [['Hampton Wool Fedora', 'Tobacco / L', 148]])]],
]

const TAGS: Record<string, string[]> = {
  c01: ['VIP', 'Repeat buyer', 'Hat Club', 'Newsletter'], c02: ['Newsletter'], c03: ['Wholesale', 'Net-30'], c04: ['Repeat buyer'], c05: ['Repeat buyer', 'Newsletter'],
  c06: ['Repeat buyer'], c07: ['VIP', 'Collector', 'Hat Club'], c09: ['Newsletter'], c11: ['International'], c13: ['VIP'], c14: ['Wholesale', 'Press'],
  c16: ['Hat Club'], c18: ['Repeat buyer'], c19: ['Press'],
}
const GUESTS = new Set(['c10'])
const STREETS = ['Atlantic Ave', 'Hawthorne Blvd', 'Congress Ave', 'Ocean View Dr', 'Music Row', 'Milwaukee Ave', 'Canyon Rd', 'Bull St', 'Pike St', 'Queen St W', 'Marylebone High St', 'Peachtree St', 'Valencia St', 'Sunset Blvd', 'Nicollet Ave', 'Magazine St', 'Larimer St', 'Penn Ave', 'Newbury St', 'Camelback Rd']

function phoneFor(n: number, region: string) {
  if (region === 'UK') return `+44 20 7946 0${String(100 + n).slice(-3)}`
  if (region === 'ON') return `+1 (416) 555-01${String(n).padStart(2, '0')}`
  return `+1 (555) 01${String(n).padStart(2, '0')}-${String(4000 + n * 37).slice(-4)}`
}

function address(n: number, name: string, location: string): ShippingAddress {
  const [city, region] = location.split(', ')
  const country = region === 'UK' ? 'United Kingdom' : region === 'ON' ? 'Canada' : 'United States'
  return { name, line1: `${120 + n * 41} ${STREETS[(n - 1) % STREETS.length]}`, city, region: region === 'UK' ? '' : region, zip: region === 'UK' ? 'W1U 4EA' : region === 'ON' ? 'M5V 2T6' : String(10000 + n * 2371).slice(0, 5), country }
}

export const customers: Customer[] = seeds.map(([id, name, email, location, sinceDays, orders, note]) => {
  const n = Number(id.slice(1))
  const guest = GUESTS.has(id)
  const gid = 7000 + n * 37
  return {
    id,
    name,
    email,
    phone: guest ? null : phoneFor(n, location.split(', ')[1]),
    location,
    tags: TAGS[id] ?? [],
    shopifyCustomerId: guest ? null : `gid://shopify/Customer/${gid}`,
    adminUrl: guest ? null : `https://admin.shopify.com/store/goorin/customers/${gid}`,
    customerSince: daysAgo(sinceDays),
    note: note ?? null,
    orders: orders.map((o) => ({ ...o, shippingAddress: address(n, name, location) })),
  }
})
