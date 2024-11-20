document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = searchInput.value.trim();
            if (searchTerm) {
                // Redirect to search page with the search term
                window.location.href = `artish/search.html?q=${encodeURIComponent(searchTerm)}`;
            }
        }
    });
});
