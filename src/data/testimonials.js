// Customer testimonials and reviews for PlanningKart

export const testimonials = [
    {
        id: 1,
        name: 'Priya Sharma',
        event: 'Pottery Workshop',
        rating: 5,
        comment: 'Absolutely loved the pottery workshop! The instructor was patient and knowledgeable. I created a beautiful vase that now sits in my living room. Highly recommend PlanningKart for finding such amazing experiences!',
        image: 'customer-1.jpg',
        date: '2026-01-15',
    },
    {
        id: 2,
        name: 'Rahul Mehta',
        event: 'VR Gaming Experience',
        rating: 5,
        comment: 'The VR gaming session was mind-blowing! State-of-the-art equipment and a huge variety of games. Perfect for team outings. We had an amazing time and will definitely book again.',
        image: 'customer-2.jpg',
        date: '2026-01-20',
    },
    {
        id: 3,
        name: 'Anjali Reddy',
        event: 'Canvas Painting Session',
        rating: 4,
        comment: 'Great experience for beginners! The instructor helped me create my first painting and I\'m so proud of it. The venue was cozy and all materials were provided. Would love to try more workshops.',
        image: 'customer-3.jpg',
        date: '2026-01-22',
    },
    {
        id: 4,
        name: 'Karthik Kumar',
        event: 'Nandi Hills Trek',
        rating: 5,
        comment: 'Best sunrise trek ever! Well-organized, punctual pickup, and the breakfast at the top was delicious. PlanningKart made the entire booking process so easy. Can\'t wait for the next adventure!',
        image: 'customer-4.jpg',
        date: '2026-01-25',
    },
    {
        id: 5,
        name: 'Sneha Patel',
        event: 'Italian Cooking Class',
        rating: 5,
        comment: 'Learned to make authentic pasta from scratch! The chef was fantastic and the class was so much fun. Plus, we got to eat everything we made. Worth every penny!',
        image: 'customer-5.jpg',
        date: '2026-01-28',
    },
    {
        id: 6,
        name: 'Arjun Nair',
        event: 'Escape Room Challenge',
        rating: 4,
        comment: 'Super thrilling experience! The puzzles were challenging but solvable. Great for team building. We barely escaped in time! The staff was friendly and helpful.',
        image: 'customer-6.jpg',
        date: '2026-01-30',
    },
    {
        id: 7,
        name: 'Divya Iyer',
        event: 'Bollywood Dance Workshop',
        rating: 5,
        comment: 'So much fun! The choreography was energetic and the instructor made it easy to follow. Great workout and entertainment combined. Booking through PlanningKart was seamless.',
        image: 'customer-7.jpg',
        date: '2026-02-01',
    },
    {
        id: 8,
        name: 'Vikram Singh',
        event: 'Photography Workshop',
        rating: 5,
        comment: 'Excellent workshop for DSLR beginners! Learned so much about composition and lighting. The outdoor session was the highlight. Highly recommend for photography enthusiasts!',
        image: 'customer-8.jpg',
        date: '2026-02-03',
    },
];

// Helper function to get average rating
export const getAverageRating = () => {
    const sum = testimonials.reduce((acc, curr) => acc + curr.rating, 0);
    return (sum / testimonials.length).toFixed(1);
};

// Helper function to get total reviews count
export const getTotalReviews = () => {
    return testimonials.length;
};
