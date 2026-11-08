/* Sample data, copied from cmfstack-3d.html (MATS, ZONES, PRESETS, PAINTS). Renders are captured from the configurator. */
const renders = import.meta.glob('./assets/renders/*', { eager: true, import: 'default' }) as Record<string, string>
export const img = (name: string) => renders[`./assets/renders/${name}`]

export type Material = {
  id: string
  name: string
  type: string
  supplier: string
  cost: string
  dur: string
  sus: string
}

export type Zone = {
  id: string
  name: string
  line: string
  def: string
  mats: Material[]
}

export const ZONES: Zone[] = [
  {
    id: 'z1',
    name: 'Seats',
    line: 'Nappa in three colours or a charcoal wool weave, seen from the rear bench.',
    def: 'm2',
    mats: [
      { id: 'm1', name: 'Nappa Leather, Black', type: 'Leather', supplier: 'Bridge of Weir', cost: '£45/m²', dur: 'High', sus: 'B+' },
      { id: 'm2', name: 'Nappa Leather, Cognac', type: 'Leather', supplier: 'Bridge of Weir', cost: '£48/m²', dur: 'High', sus: 'B+' },
      { id: 'm3', name: 'Nappa Leather, Cream', type: 'Leather', supplier: 'Muirhead', cost: '£42/m²', dur: 'High', sus: 'A-' },
      { id: 'm13', name: 'Woven Wool, Charcoal', type: 'Fabric', supplier: 'Kvadrat', cost: '£34/m²', dur: 'Medium', sus: 'A' },
    ],
  },
  {
    id: 'z2',
    name: 'Door panels',
    line: 'Textile, leather or open-pore walnut on the panel your arm rests against.',
    def: 'm4',
    mats: [
      { id: 'm4', name: 'Woven Textile, Taupe', type: 'Fabric', supplier: 'Kvadrat', cost: '£32/m²', dur: 'Medium', sus: 'A' },
      { id: 'm5', name: 'Leather Panel, Bordeaux', type: 'Leather', supplier: 'Bridge of Weir', cost: '£52/m²', dur: 'High', sus: 'B' },
      { id: 'm6', name: 'Open Pore Walnut Veneer', type: 'Wood veneer', supplier: 'Tabu S.p.A', cost: '£65/m²', dur: 'Medium', sus: 'B' },
      { id: 'm14', name: 'Woven Textile, Charcoal', type: 'Fabric', supplier: 'Kvadrat', cost: '£32/m²', dur: 'Medium', sus: 'A' },
    ],
  },
  {
    id: 'z3',
    name: 'Headliner',
    line: 'Alcantara in black or light grey over the largest surface in the cabin.',
    def: 'm7',
    mats: [
      { id: 'm7', name: 'Black Suede', type: 'Alcantara', supplier: 'Alcantara S.p.A', cost: '£38/m²', dur: 'High', sus: 'B+' },
      { id: 'm8', name: 'Light Grey Suede', type: 'Alcantara', supplier: 'Alcantara S.p.A', cost: '£38/m²', dur: 'High', sus: 'B+' },
    ],
  },
  {
    id: 'z4',
    name: 'Centre console',
    line: 'Brushed aluminium, a matte composite or burl wood across the dash and console.',
    def: 'm10',
    mats: [
      { id: 'm9', name: 'Brushed Aluminium', type: 'Metal trim', supplier: 'Novelis EU', cost: '£28/unit', dur: 'Very high', sus: 'A-' },
      { id: 'm10', name: 'Matte Black Finish', type: 'Composite', supplier: 'SGL Carbon', cost: '£35/unit', dur: 'Very high', sus: 'B+' },
      { id: 'm11', name: 'Burl Wood Accent', type: 'Wood veneer', supplier: 'Tabu S.p.A', cost: '£72/unit', dur: 'Medium', sus: 'B' },
    ],
  },
  {
    id: 'z5',
    name: 'Steering wheel',
    line: 'Perforated leather, Alcantara or smooth cream leather on the rim the driver holds.',
    def: 'm12',
    mats: [
      { id: 'm12', name: 'Perforated Leather', type: 'Leather', supplier: 'Bader GmbH', cost: '£18/unit', dur: 'Very high', sus: 'B+' },
      { id: 'm15', name: 'Alcantara Rim, Black', type: 'Alcantara', supplier: 'Alcantara S.p.A', cost: '£16/unit', dur: 'High', sus: 'B+' },
      { id: 'm16', name: 'Smooth Leather, Cream', type: 'Leather', supplier: 'Bader GmbH', cost: '£19/unit', dur: 'High', sus: 'B+' },
    ],
  },
]

export const zoneRender = (zone: string, mat: string) => img(`zone-${zone}-${mat}.jpg`)

export const VIEWS = [
  { id: 'exterior', name: 'Exterior', text: 'Orbit the car to judge the cabin through the glass, the way a customer first sees it.' },
  { id: 'overview', name: 'Cutaway', text: 'The near side and roof are cut away, so every zone reads at once in its real proportions.' },
  { id: 'driver', name: 'Driver', text: 'Sit behind the wheel and look at the dash, door and headliner from the seat that matters most.' },
  { id: 'rear', name: 'Rear seat', text: 'The view a passenger has of the front seats, their backs and the headliner above them.' },
]

export const PRESETS = [
  { name: 'Premium Dark', score: 94 },
  { name: 'Warm Contrast', score: 89 },
  { name: 'Nordic Light', score: 86 },
]

export const PAINTS = ['Glacier White', 'Midnight Blue', 'Graphite', 'Racing Green', 'Burnt Copper']

export const MODEL_CREDIT = {
  title: 'Honda E (Detailed Interior) 2021',
  author: 'Alex Murias (Xlay3D)',
  src: 'https://sketchfab.com/3d-models/free-honda-e-detailed-interior-2021-814cf3f8cfd64594b1c4f96e873c3cef',
  license: 'https://creativecommons.org/licenses/by/4.0/',
}
