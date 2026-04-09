// Sri Lanka — 9 provinces with their constituent districts
// District names match keys in sriLankaDistricts.ts

export interface Province {
  id: string;
  name: string;
  districts: string[];
}

export const PROVINCES: Province[] = [
  {
    id: 'western',
    name: 'Western Province',
    districts: ['Colombo', 'Gampaha', 'Kaḷutara'],
  },
  {
    id: 'central',
    name: 'Central Province',
    districts: ['Kandy', 'Matale', 'Nuwara Eliya'],
  },
  {
    id: 'southern',
    name: 'Southern Province',
    districts: ['Galle', 'Matara', 'Hambantota'],
  },
  {
    id: 'northern',
    name: 'Northern Province',
    districts: ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  },
  {
    id: 'eastern',
    name: 'Eastern Province',
    districts: ['Batticaloa', 'Ampara', 'Trincomalee'],
  },
  {
    id: 'north_western',
    name: 'North Western Province',
    districts: ['Kurunegala', 'Puttalam'],
  },
  {
    id: 'north_central',
    name: 'North Central Province',
    districts: ['Anuradhapura', 'Polonnaruwa'],
  },
  {
    id: 'uva',
    name: 'Uva Province',
    districts: ['Badulla', 'Moneragala'],
  },
  {
    id: 'sabaragamuwa',
    name: 'Sabaragamuwa Province',
    districts: ['Ratnapura', 'Kegalle'],
  },
];
