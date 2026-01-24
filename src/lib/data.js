
// Initial mock data
let requests = [
    {
        id: '1',
        patientName: 'Sarah Johnson',
        bloodType: 'O+',
        location: 'City General Hospital',
        urgency: 'High',
        units: 2,
        timePosted: '10 mins ago',
        distance: '1.2 km', // Close match
    },
    {
        id: '2',
        patientName: 'Michael Chen',
        bloodType: 'AB-',
        location: 'St. Mary’s Medical Center',
        urgency: 'High',
        units: 1,
        timePosted: '25 mins ago',
        distance: '3.5 km',
    },
    {
        id: '3',
        patientName: 'Emma Wilson',
        bloodType: 'A+',
        location: 'Memorial Hospital',
        urgency: 'Medium',
        units: 3,
        timePosted: '1 hour ago',
        distance: '5.0 km',
    },
    {
        id: '4',
        patientName: 'James Rodriguez',
        bloodType: 'B-',
        location: 'Children’s Hospital',
        urgency: 'Low',
        units: 1,
        timePosted: '3 hours ago',
        distance: '8.2 km',
    },
    {
        id: '5',
        patientName: 'Anita Patel',
        bloodType: 'O+',
        location: 'University Clinic',
        urgency: 'Medium',
        units: 2,
        timePosted: '5 hours ago',
        distance: '12 km',
    },
];

export const getRequests = () => requests;

export const addRequest = (request) => {
    requests.unshift(request);
};


// Mock Donors Data
const donors = [
    {
        id: '1',
        name: 'John Doe',
        bloodGroup: 'O+',
        location: 'New York, USA',
        availability: 'Available',
        lastDonation: '2 months ago',
        contact: '+1 234 567 890',
        email: 'john.doe@example.com',
        bio: 'Regular donor, happy to help whenever possible.',
        verified: true,
    },
    {
        id: '2',
        name: 'Jane Smith',
        bloodGroup: 'A-',
        location: 'Los Angeles, USA',
        availability: 'Unavailable',
        lastDonation: '1 week ago',
        contact: '+1 987 654 321',
        email: 'jane.smith@example.com',
        bio: 'Passionate about saving lives.',
        verified: true,
    },
    {
        id: '3',
        name: 'Robert Brown',
        bloodGroup: 'B+',
        location: 'Chicago, USA',
        availability: 'Available',
        lastDonation: '6 months ago',
        contact: '+1 555 123 456',
        email: 'robert.b@example.com',
        bio: 'First time donor, looking to contribute.',
        verified: false,
    },
    {
        id: '4',
        name: 'Emily Davis',
        bloodGroup: 'AB+',
        location: 'Houston, USA',
        availability: 'Available',
        lastDonation: '3 months ago',
        contact: '+1 444 777 888',
        email: 'emily.d@example.com',
        bio: 'Dedicated to community service.',
        verified: true,
    },
    {
        id: '5',
        name: 'Michael Wilson',
        bloodGroup: 'O-',
        location: 'Phoenix, USA',
        availability: 'Available',
        lastDonation: '5 months ago',
        contact: '+1 222 333 444',
        email: 'michael.w@example.com',
        bio: 'Universal donor.',
        verified: true,
    },
];



export const getDonors = () => donors;

export const getDonorById = (id) => donors.find((donor) => donor.id === id);

// Keep this for backward compatibility if needed, but prefer getRequests()
export const MOCK_REQUESTS = requests;
