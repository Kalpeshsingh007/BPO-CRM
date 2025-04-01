// In-memory database for the MVP
const db = {
    customers: [
      {
        id: 1,
        name: "Acme Corporation",
        contact: "Pawan Vaidya",
        email: "pawan@acme.com",
        phone: "9856237412",
        status: "Active",
        lastContact: "2023-03-15"
      },
      {
        id: 2,
        name: "XYZ Industries",
        contact: "Ajinkya Bhandari",
        email: "ajinkya@xyz.com",
        phone: "9632587412",
        status: "Active",
        lastContact: "2023-03-10"
      }
    ],
    leads: [
      {
        id: 1,
        company: "New Venture Inc",
        contact: "Omkar Joshi",
        email: "omkar@newventure.com",
        phone: "9876895623",
        status: "New",
        source: "Website",
        notes: "Interested in call center services"
      }
    ],
    tasks: [
      {
        id: 1,
        title: "Follow up with XYZ Industries",
        description: "Discuss new service proposal",
        dueDate: "2023-03-20",
        assignedTo: "Ajinkya Bhadari",
        status: "Pending",
        relatedTo: "customer",
        relatedId: 2
      }
    ],
    emails: [
      {
        id: 1,
        to: "omkar@newventure.com",
        subject: "BPO Service Proposal",
        body: "Thank you for your interest in our services. Please find attached our proposal.",
        date: "2023-03-15 14:30",
        status: "Sent",
        relatedTo: "lead",
        relatedId: 1
      }
    ],
    calls: [
      {
        id: 1,
        contact: "Ajinkya Bhandari",
        phone: "9632587412",
        date: "2023-03-16 10:15",
        duration: 15,
        outcome: "Spoke to Contact",
        notes: "Discussed service expansion options",
        relatedTo: "customer",
        relatedId: 2
      }
    ]
  };
  
  module.exports = db;