export const TABLES_DATA = [
  {
    id: 1,
    name: 'Table 1',
    description: 'Small Table',
    price: 150,
    status: 'available', // available, reserved, unavailable
    image: '/assets/table-small.jpg'
  },
  {
    id: 2,
    name: 'Table 2',
    description: 'Small Table',
    price: 150,
    status: 'available',
    image: '/assets/table-small.jpg'
  },
  {
    id: 3,
    name: 'Table 3',
    description: 'Small Table',
    price: 150,
    status: 'unavailable',
    image: '/assets/table-small.jpg'
  },
  {
    id: 4,
    name: 'Table 4',
    description: 'Big Table',
    price: 200,
    status: 'available',
    image: '/assets/table-big.jpg'
  },
  {
    id: 5,
    name: 'Table 5',
    description: 'Big Table',
    price: 200,
    status: 'reserved',
    image: '/assets/table-big.jpg',
    reservedBy: 'Rahul'
  },
  {
    id: 6,
    name: 'Table 6',
    description: 'Small Table',
    price: 150,
    status: 'unavailable',
    image: '/assets/table-small.jpg'
  }
];

export const AVAILABILITY_DATA = {
  dates: ['Today', 'Tomorrow'],
  times: ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00'],
  durations: [
    { label: '1 Hour', value: 1 },
    { label: '2 Hours', value: 2 },
    { label: '3 Hours', value: 3 },
    { label: '4 Hours', value: 4 }
  ]
};

export const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${mStr} ${ampm}`;
};
