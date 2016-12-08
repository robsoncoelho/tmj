Rails.application.routes.draw do
  devise_for :user
  
  namespace :api do
    get '/ramona/(:page)/(:quantity)', to: 'general#editors', id: :ramona, defaults: { page: 1, quantity: 10 }
    get '/all/(:page)/(:quantity)', to: 'general#all', defaults: { page: 1, quantity: 10 }
    get '/all_without_editors/(:page)/(:quantity)', to: 'general#all_without_editors', defaults: { page: 1, quantity: 10 }

    get '/highlights', to: 'general#highlights'

    post '/register', to: 'castings#create'

    get '/castings/download', to: 'castings#download'
    
    resources :cards, only: [:create]
    resources :images, only: [:create]
    resources :videos, only: [:create]
  end

  namespace :admin do
    resources :cards do
      collection do
        post :accept
        post :reject
        get :total
      end
    end
    
    resources :casting, only: [:index] do
      collection do
        get :download
      end
    end
    
    root to: 'cards#index'
  end

  root :to => proc { |env| [ 200, {}, ['.'] ] }
end
