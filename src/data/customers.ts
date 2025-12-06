export interface Customer {
  id: string;
  name: string;
  age: number;
  city: string;
  phone: string;
  email: string;
  monthlyIncome: number;
  currentLoans: {
    type: string;
    amount: number;
    emi: number;
  }[];
  creditScore: number;
  preApprovedLimit: number;
  occupation: string;
  employerName: string;
}

export const customers: Customer[] = [
  {
    id: "CUST001",
    name: "Rajesh Kumar",
    age: 35,
    city: "Mumbai",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@email.com",
    monthlyIncome: 85000,
    currentLoans: [{ type: "Home Loan", amount: 2500000, emi: 22000 }],
    creditScore: 780,
    preApprovedLimit: 500000,
    occupation: "Software Engineer",
    employerName: "TCS"
  },
  {
    id: "CUST002",
    name: "Priya Sharma",
    age: 28,
    city: "Delhi",
    phone: "+91 98765 43211",
    email: "priya.sharma@email.com",
    monthlyIncome: 65000,
    currentLoans: [],
    creditScore: 750,
    preApprovedLimit: 400000,
    occupation: "Marketing Manager",
    employerName: "Infosys"
  },
  {
    id: "CUST003",
    name: "Amit Patel",
    age: 42,
    city: "Ahmedabad",
    phone: "+91 98765 43212",
    email: "amit.patel@email.com",
    monthlyIncome: 120000,
    currentLoans: [{ type: "Car Loan", amount: 800000, emi: 15000 }],
    creditScore: 820,
    preApprovedLimit: 800000,
    occupation: "Business Owner",
    employerName: "Self Employed"
  },
  {
    id: "CUST004",
    name: "Sneha Reddy",
    age: 31,
    city: "Hyderabad",
    phone: "+91 98765 43213",
    email: "sneha.reddy@email.com",
    monthlyIncome: 95000,
    currentLoans: [{ type: "Education Loan", amount: 500000, emi: 8000 }],
    creditScore: 690,
    preApprovedLimit: 350000,
    occupation: "Data Scientist",
    employerName: "Amazon"
  },
  {
    id: "CUST005",
    name: "Vikram Singh",
    age: 45,
    city: "Bangalore",
    phone: "+91 98765 43214",
    email: "vikram.singh@email.com",
    monthlyIncome: 150000,
    currentLoans: [],
    creditScore: 850,
    preApprovedLimit: 1000000,
    occupation: "VP Engineering",
    employerName: "Google"
  },
  {
    id: "CUST006",
    name: "Ananya Gupta",
    age: 26,
    city: "Pune",
    phone: "+91 98765 43215",
    email: "ananya.gupta@email.com",
    monthlyIncome: 55000,
    currentLoans: [],
    creditScore: 720,
    preApprovedLimit: 300000,
    occupation: "UI Designer",
    employerName: "Flipkart"
  },
  {
    id: "CUST007",
    name: "Mohammed Khan",
    age: 38,
    city: "Chennai",
    phone: "+91 98765 43216",
    email: "mohammed.khan@email.com",
    monthlyIncome: 75000,
    currentLoans: [{ type: "Personal Loan", amount: 200000, emi: 6000 }],
    creditScore: 680,
    preApprovedLimit: 250000,
    occupation: "Civil Engineer",
    employerName: "L&T"
  },
  {
    id: "CUST008",
    name: "Kavitha Nair",
    age: 33,
    city: "Kochi",
    phone: "+91 98765 43217",
    email: "kavitha.nair@email.com",
    monthlyIncome: 70000,
    currentLoans: [],
    creditScore: 760,
    preApprovedLimit: 450000,
    occupation: "Doctor",
    employerName: "Apollo Hospitals"
  },
  {
    id: "CUST009",
    name: "Suresh Yadav",
    age: 50,
    city: "Jaipur",
    phone: "+91 98765 43218",
    email: "suresh.yadav@email.com",
    monthlyIncome: 45000,
    currentLoans: [{ type: "Gold Loan", amount: 100000, emi: 3500 }],
    creditScore: 640,
    preApprovedLimit: 150000,
    occupation: "Teacher",
    employerName: "Govt School"
  },
  {
    id: "CUST010",
    name: "Deepa Menon",
    age: 29,
    city: "Kolkata",
    phone: "+91 98765 43219",
    email: "deepa.menon@email.com",
    monthlyIncome: 80000,
    currentLoans: [],
    creditScore: 790,
    preApprovedLimit: 550000,
    occupation: "CA",
    employerName: "Deloitte"
  }
];

export const getCustomerByPhone = (phone: string): Customer | undefined => {
  return customers.find(c => c.phone.replace(/\s/g, '').includes(phone.replace(/\s/g, '')));
};

export const getCustomerById = (id: string): Customer | undefined => {
  return customers.find(c => c.id === id);
};
