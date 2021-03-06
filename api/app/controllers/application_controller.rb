class ApplicationController < ActionController::Base
  respond_to :html, :json
  # protect_from_forgery with: :exception
  before_action :configure_permitted_parameters, if: :devise_controller?

  protected
    def authenticate_user!(opts={})
      if user_signed_in?
        super
      else
        return render nothing: true, status: 403 if request.format.symbol == :json
        redirect_to "/login?redirect_url=#{request.path}"
      end
    end

    def configure_permitted_parameters
      devise_parameter_sanitizer.permit(:sign_up, keys: [:username, :email, :password])
      devise_parameter_sanitizer.permit(:account_update, keys: [:username, :email, :password])
    end
end
