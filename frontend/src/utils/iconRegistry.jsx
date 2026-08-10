import {
  // Umum / administrasi — berlaku untuk perangkat daerah mana pun
  Description, Assignment, Badge, AccountBalance, Gavel, Receipt, Payments,
  Folder, Article, Business, Public, SupportAgent, Groups, Person, VerifiedUser,
  DocumentScanner, Handshake, Campaign, Event, LocationCity, Apartment,
  // Sektoral
  School, MenuBook, Work, Engineering, Construction, DirectionsCar, DirectionsBus,
  Home as HomeIcon, Agriculture, Forest, WaterDrop, Bolt, Store, Savings,
  Landscape, LocalPolice, LocalFireDepartment, Recycling, Wifi,
  // Kesehatan
  HealthAndSafety, LocalHospital, MedicalServices, Vaccines, Medication, Healing,
  MonitorHeart, Bloodtype, Biotech, Science, PregnantWoman, FamilyRestroom,
  Emergency
} from '@mui/icons-material'

/**
 * One registry for content icons — services, statistics, anything an admin
 * picks by name — shared by every admin picker and public renderer. Previously the admin offered 15 health-only icons while three
 * separate public components each kept their own partial map, so an icon chosen
 * in the admin could silently render as something else.
 *
 * Grouped only to keep the admin dropdown navigable; the stored value is the
 * plain key.
 */
export const ICON_GROUPS = [
  {
    label: 'Umum & Administrasi',
    icons: {
      Description, Assignment, Badge, DocumentScanner, VerifiedUser, Receipt,
      Payments, Folder, Article, Gavel, AccountBalance, Business, Public,
      SupportAgent, Groups, Person, Handshake, Campaign, Event, LocationCity,
      Apartment
    }
  },
  {
    label: 'Sektoral',
    icons: {
      School, MenuBook, Work, Engineering, Construction, DirectionsCar,
      DirectionsBus, Home: HomeIcon, Agriculture, Forest, WaterDrop, Bolt,
      Store, Savings, Landscape, LocalPolice, LocalFireDepartment, Recycling, Wifi
    }
  },
  {
    label: 'Kesehatan',
    icons: {
      HealthAndSafety, LocalHospital, MedicalServices, Vaccines, Medication,
      Healing, MonitorHeart, Bloodtype, Biotech, Science, PregnantWoman,
      FamilyRestroom, Emergency
    }
  }
]

export const ICONS = ICON_GROUPS.reduce(
  (all, g) => ({ ...all, ...g.icons }),
  {}
)

export const ICON_NAMES = Object.keys(ICONS)

/** Neutral default — a generic document, not a sector-specific symbol. */
export const DEFAULT_ICON = 'Description'

export const renderIcon = (name, props) => {
  const IconComp = ICONS[name] || ICONS[DEFAULT_ICON]
  return <IconComp {...props} />
}

/**
 * Stable colour for a category name. Categories are free text typed by the
 * admin, so they cannot be mapped from a fixed list — hashing keeps a given
 * category the same colour across renders and pages without assuming any sector.
 */
const CATEGORY_COLORS = ['primary', 'success', 'info', 'secondary', 'warning']
export const categoryColor = (category) => {
  if (!category) return 'default'
  let hash = 0
  for (let i = 0; i < category.length; i += 1) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0
  }
  return CATEGORY_COLORS[hash % CATEGORY_COLORS.length]
}
