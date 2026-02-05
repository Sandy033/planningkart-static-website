import './EventGallery.css';

const EventGallery = () => {
    const galleryItems = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=400&fit=crop',
            alt: 'Pottery workshop',
            title: 'Pottery Workshop'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&h=400&fit=crop',
            alt: 'Gaming event',
            title: 'Gaming Tournament'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&h=400&fit=crop',
            alt: 'Cooking class',
            title: 'Cooking Class'
        },
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=400&fit=crop',
            alt: 'Dance workshop',
            title: 'Dance Workshop'
        },
        {
            id: 5,
            image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop',
            alt: 'Adventure trek',
            title: 'Adventure Trek'
        },
        {
            id: 6,
            image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&h=400&fit=crop',
            alt: 'Art workshop',
            title: 'Art Workshop'
        }
    ];

    return (
        <section id="gallery" className="gallery-section section">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Event Gallery</h2>
                    <p className="section-description">
                        Glimpses from our amazing events and happy participants
                    </p>
                </div>
                <div className="gallery-grid">
                    {galleryItems.map((item) => (
                        <div key={item.id} className="gallery-item">
                            <img src={item.image} alt={item.alt} />
                            <div className="gallery-overlay">
                                <h4>{item.title}</h4>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default EventGallery;
