# Be sure to restart your server when you modify this file.

# Version of your assets, change this if you want to expire all your assets.
Rails.application.config.assets.version = '1.0'


# Add additional assets to the asset load path
Rails.application.config.assets.paths << Rails.root.join('vendor', 'assets', 'fonts')
Rails.application.config.assets.paths << Rails.root.join('app', 'assets', 'templates')
Rails.application.config.assets.paths << Rails.root.join('vendor', 'assets', 'components')

# Precompile additional assets.
# application.js, application.css, and all non-JS/CSS in app/assets folder are already added.
Rails.application.config.assets.precompile += %w( admin.css admin.js site.css site.js register.css register.js remix.css remix.js remix.menu.js )
Rails.application.config.assets.precompile << /\.(?:svg|eot|woff|ttf|html)$/
