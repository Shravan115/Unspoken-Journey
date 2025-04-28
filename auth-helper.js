// Auth Helper Functions
const authHelper = {
    // Initialize auth state
    init: async function() {
        try {
            console.log('Starting auth initialization...');
            await firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
            console.log('Auth persistence set to LOCAL');
            
            // Wait for auth state to be ready
            await new Promise((resolve) => {
                const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                    unsubscribe();
                    console.log('Auth state initialized');
                    resolve();
                });
            });
            
            console.log('Auth initialization completed');
        } catch (error) {
            console.error('Error in auth initialization:', error);
            throw error;
        }
    },

    // Check if user is authenticated
    checkAuth: async function() {
        return new Promise((resolve) => {
            const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                unsubscribe(); // Unsubscribe once we get the auth state
                if (user) {
                    console.log('User is authenticated:', user.uid);
                    resolve(true);
                } else {
                    console.log('User is not authenticated');
                    resolve(false);
                }
            });
        });
    },

    // Get current user
    getCurrentUser: function() {
        const user = firebase.auth().currentUser;
        if (!user) {
            console.warn('No current user found');
        }
        return user;
    },

    // Redirect to login if not authenticated
    requireAuth: async function() {
        const isAuthenticated = await this.checkAuth();
        if (!isAuthenticated) {
            console.log('Authentication required, redirecting to login');
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
};

// Export the helper
window.authHelper = authHelper; 