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
      nameInput: document.getElementById('community-name'),
      descInput: document.getElementById('community-desc'),
      nameCount: document.getElementById('name-count'),
      descCount: document.getElementById('desc-count')
    };

    if (!this.elements.createForm || !this.elements.communitiesList) {
      throw new Error('Required elements missing');
    }
  }

  setupEventListeners() {
    // Form submission
    if (this.elements.createForm) {
      this.elements.createForm.addEventListener('submit', (e) => this.handleCreateCommunity(e));
    }
    
    // Character counters
    if (this.elements.nameInput && this.elements.descInput) {
      this.elements.nameInput.addEventListener('input', () => {
        this.elements.nameCount.textContent = this.elements.nameInput.value.length;
      });
      this.elements.descInput.addEventListener('input', () => {
        this.elements.descCount.textContent = this.elements.descInput.value.length;
      });
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
    document.querySelectorAll('.join-btn').forEach(btn => {
      btn?.addEventListener('click', (e) => this.handleJoinLeaveCommunity(e));
    });
  }

  async handleCreateCommunity(e) {
    e.preventDefault();
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    this.showLoading(submitBtn);
    
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
    const target = e?.target?.closest('.join-btn');
    if (!target) return;
    
    const communityId = target?.dataset?.communityId;
    const currentAction = target.textContent.trim().toLowerCase();
    const action = currentAction === 'join' ? 'join' : 'leave';
    const originalText = target.innerHTML;

    if (!communityId) return;

    this.showLoading(target);
    
    try {
      const response = await fetch(`/communities/${communityId}/${action}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.showNotification(`Successfully ${action}ed community`, 'success');
        if (data.memberCount !== undefined) {
          target.closest('.community-card')
            ?.querySelector('.member-count').textContent = `${data.memberCount} members`;
        }
        target.textContent = action === 'join' ? 'Leave' : 'Join';
      } else {
        const error = await response.json();
        this.showNotification(error.error || `${action} failed`, 'error');
      }
    } catch (error) {
      this.showNotification(`Error ${action}ing community`, 'error');
      console.error('Join/Leave error:', error);
    } finally {
      this.resetLoading(target, originalText);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    const notificationArea = document.getElementById('notification-area');
    notificationArea.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 500);
    }, 3000);
  }

  showLoading(button) {
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
  }

  resetLoading(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
  }

  showEditModal(community) {
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

// Initialize the manager
new CommunitiesManager();
