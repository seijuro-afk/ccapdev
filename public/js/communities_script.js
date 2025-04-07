// Communities Management System
class CommunitiesManager {
  constructor() {
    this.init();
  }

  async init() {
    try {
      // Wait for DOM and verify elements
      await this.verifyDOMReady();
      this.cacheElements();
      this.setupEventListeners();
      console.log('Communities system initialized');
    } catch (error) {
      console.error('Initialization failed:', error);
    }
  }

  verifyDOMReady() {
    return new Promise((resolve) => {
      if (document.readyState !== 'loading') {
        resolve();
      } else {
        document.addEventListener('DOMContentLoaded', resolve);
      }
    });
  }

  cacheElements() {
    this.elements = {
      createForm: document.getElementById('create-community-form'),
      communitiesList: document.querySelector('.communities-list'),
      // Add other element selectors as needed
    };

    if (!this.elements.createForm || !this.elements.communitiesList) {
      throw new Error('Required elements missing');
    }
  }

  setupEventListeners() {
    // Form submission
    this.elements.createForm.addEventListener('submit', (e) => this.handleCreateCommunity(e));
    
    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleDeleteCommunity(e));
    });

    // Join/Leave buttons
    document.querySelectorAll('.join-leave-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.handleJoinLeaveCommunity(e));
    });
  }

  async handleCreateCommunity(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const response = await fetch('/communities', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description')
        })
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        this.showAlert(error.error || 'Failed to create community');
      }
    } catch (error) {
      console.error('Create community error:', error);
      this.showAlert('Error creating community');
    }
  }

  async handleDeleteCommunity(e) {
    try {
      const target = e.target.closest('.delete-btn');
      const communityId = target?.dataset?.communityId;
      
      if (!communityId || !confirm('Delete this community?')) return;

      const response = await fetch(`/communities/${communityId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        target.closest('.community-card')?.remove() || window.location.reload();
      } else {
        const error = await response.json();
        this.showAlert(error.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      this.showAlert('Error deleting community');
    }
  }

  async handleJoinLeaveCommunity(e) {
    try {
      const target = e.target.closest('.join-leave-btn');
      const communityId = target?.dataset?.communityId;
      const action = target?.dataset?.action;

      if (!communityId || !action) return;

      const response = await fetch(`/communities/${communityId}/${action}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        window.location.reload();
      } else {
        const error = await response.json();
        this.showAlert(error.error || `${action} failed`);
      }
    } catch (error) {
      console.error('Join/Leave error:', error);
      this.showAlert(`Error ${action}ing community`);
    }
  }

  showAlert(message) {
    // Implement a nice alert/notification system
    alert(message); // Replace with toast/notification UI
  }
}

// Initialize the manager
new CommunitiesManager();
