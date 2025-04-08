// Communities Management System
class CommunitiesManager {
  constructor() {
    this.init();
  }

  async init() {
    try {
      console.log('Initializing communities system...');
      // Wait for DOM and verify elements
      await this.verifyDOMReady();
      console.log('DOM ready, verifying elements exist...');
      
      // Verify critical elements exist before proceeding
      const requiredElements = [
        'create-community-form',
        'communities-list',
        'community-name',
        'community-desc',
        'name-count',
        'desc-count'
      ];
      
      for (const id of requiredElements) {
        if (!document.getElementById(id) && !document.querySelector(`.${id}`)) {
          throw new Error(`Required element not found: ${id}`);
        }
      }
      
      console.log('All required elements found, initializing...');
      this.cacheElements();
      console.log('Elements cached, setting up event listeners...');
      this.setupEventListeners();
      console.log('Communities system initialized successfully');
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
    try {
      console.log('Caching form elements...');
      this.elements = {
        createForm: document.getElementById('create-community-form'),
        communitiesList: document.querySelector('.communities-list'),
        nameInput: document.getElementById('community-name'),
        descInput: document.getElementById('community-desc'),
        nameCount: document.getElementById('name-count'),
        descCount: document.getElementById('desc-count')
      };

      // Verify all elements exist
      for (const [key, element] of Object.entries(this.elements)) {
        if (!element) {
          console.error(`Missing required element: ${key}`);
          throw new Error(`Required element missing: ${key}`);
        }
      }

      console.log('All required elements found:', this.elements);
    } catch (error) {
      console.error('Error caching elements:', error);
      throw error;
    }
  }

  setupEventListeners() {
    try {
      // Form submission
      if (this.elements.createForm) {
        this.elements.createForm.addEventListener('submit', (e) => this.handleCreateCommunity(e));
      }
      
      // Character counters with null checks
      if (this.elements.nameInput && this.elements.nameCount) {
        this.elements.nameInput.addEventListener('input', () => {
          if (this.elements.nameCount) {
            this.elements.nameCount.textContent = this.elements.nameInput.value.length;
          }
        });
      }

      if (this.elements.descInput && this.elements.descCount) {
        this.elements.descInput.addEventListener('input', () => {
          if (this.elements.descCount) {
            this.elements.descCount.textContent = this.elements.descInput.value.length;
          }
        });
      }
    } catch (error) {
      console.error('Error setting up event listeners:', error);
    }

    // Delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn?.addEventListener('click', (e) => this.handleDeleteCommunity(e));
    });

    // Edit buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn?.addEventListener('click', async (e) => {
        const communityId = e.target.closest('.edit-btn').dataset.communityId;
        try {
          const response = await fetch(`/communities/${communityId}`);
          if (response.ok) {
            const community = await response.json();
            this.showEditModal(community);
          } else {
            this.showNotification('Failed to load community', 'error');
          }
        } catch (error) {
          this.showNotification('Error loading community', 'error');
          console.error('Load error:', error);
        }
      });
    });

    // Join/Leave buttons
    document.querySelectorAll('.btn.join-btn, .btn.leave-btn').forEach(btn => {
      btn?.addEventListener('click', (e) => this.handleJoinLeaveCommunity(e));
    });
  }

  async handleCreateCommunity(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Client-side validation
    const name = e.target.elements['name'].value.trim();
    const description = e.target.elements['description'].value.trim();
    
    if (!name || name.length < 3) {
      this.showNotification('Community name must be at least 3 characters', 'error');
      return;
    }
    
    if (!description || description.length < 10) {
      this.showNotification('Description must be at least 10 characters', 'error');
      return;
    }

    this.showLoading(submitBtn);
    
    try {
      const response = await fetch('/communities', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ name, description })
      });

      if (response.ok) {
        this.showNotification('Community created successfully', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } else {
        const error = await response.json();
        this.showNotification(error.error || 'Failed to create community', 'error');
      }
    } catch (error) {
      this.showNotification('Error creating community', 'error');
      console.error('Create community error:', error);
    } finally {
      this.resetLoading(submitBtn, originalText);
    }
  }

  async handleDeleteCommunity(e) {
    const target = e.target.closest('.delete-btn');
    const communityId = target?.dataset?.communityId;
    
    if (!communityId || !confirm('Are you sure you want to delete this community?')) return;

    const originalText = target.innerHTML;
    this.showLoading(target);
    
    try {
      const response = await fetch(`/communities/${communityId}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        this.showNotification('Community deleted', 'success');
        target.closest('.community-card')?.remove();
      } else {
        const error = await response.json();
        this.showNotification(error.error || 'Delete failed', 'error');
      }
    } catch (error) {
      this.showNotification('Error deleting community', 'error');
      console.error('Delete error:', error);
    } finally {
      this.resetLoading(target, originalText);
    }
  }

  async handleJoinLeaveCommunity(e) {
    try {
      const target = e?.target?.closest('.join-btn, .leave-btn');
      if (!target) return;
      
      const communityId = target.dataset.communityId;
      const card = target.closest('.community-card');
      const isJoin = target.classList.contains('join-btn');
      const action = isJoin ? 'join' : 'leave';
      const originalText = target.innerHTML;

      if (!communityId) return;

      this.showLoading(target);
      
      const response = await fetch(`/communities/${communityId}/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: {'Content-Type': 'application/json'}
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `${action} failed`);
      }

      const data = await response.json();
      this.showNotification(`Successfully ${action}ed community`, 'success');
      
      // Update UI
      const memberCount = card.querySelector('.member-count');
      if (memberCount) memberCount.textContent = `${data.memberCount} members`;
      
      const joinBtn = card.querySelector('.join-btn');
      const leaveBtn = card.querySelector('.leave-btn');
      const joinedBtn = card.querySelector('.joined-btn');
      
      if (isJoin) {
        joinBtn?.classList.add('hidden');
        leaveBtn?.classList.remove('hidden');
        joinedBtn?.classList.remove('hidden');
      } else {
        joinBtn?.classList.remove('hidden');
        leaveBtn?.classList.add('hidden');
        joinedBtn?.classList.add('hidden');
      }
      
      // Update community card styling
      card.classList.toggle('joined-community', isJoin);
      
    } catch (error) {
      this.showNotification(error.message, 'error');
      console.error('Join/Leave error:', error);
    } finally {
      this.resetLoading(target, originalText);
    }
  }

  showNotification(message, type = 'info') {
    try {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      notification.textContent = message;
      
      const notificationArea = document.getElementById('notification-area');
      if (notificationArea) {
        notificationArea.appendChild(notification);
        
        setTimeout(() => {
          notification.classList.add('fade-out');
          setTimeout(() => notification.remove(), 500);
        }, 3000);
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  showLoading(button) {
    if (button) {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }
  }

  resetLoading(button, originalText) {
    if (button) {
      button.disabled = false;
      button.innerHTML = originalText;
    }
  }

  showEditModal(community) {
    if (!document.body) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="close-modal">&times;</span>
        <h3>Edit Community</h3>
        <form id="edit-community-form">
          <div class="form-group">
            <label>Name</label>
            <input type="text" name="name" value="${community.name}" required>
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea name="description" required>${community.description}</textarea>
          </div>
          <button type="submit" class="btn-primary">Save Changes</button>
        </form>
      </div>
    `;

    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
      modal.remove();
    });

    modal.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const submitBtn = e.target.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      
      this.showLoading(submitBtn);
      
      try {
        const response = await fetch(`/communities/${community._id}`, {
          method: 'PUT',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            name: formData.get('name'),
            description: formData.get('description')
          })
        });

        if (response.ok) {
          this.showNotification('Community updated successfully', 'success');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          const error = await response.json();
          this.showNotification(error.error || 'Update failed', 'error');
        }
      } catch (error) {
        this.showNotification('Error updating community', 'error');
        console.error('Update error:', error);
      } finally {
        this.resetLoading(submitBtn, originalText);
      }
    });
  }
}

// Initialize the manager after DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    new CommunitiesManager();
});
