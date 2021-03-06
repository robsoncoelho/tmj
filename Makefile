.PHONY: warning

BRANCH := $(shell git rev-parse --symbolic-full-name --abbrev-ref HEAD)

warning:
	@echo "Please specify a task to build."
	@exit 1

crawler:
	docker build -t "d3estudio/tmj-crawlers:$(BRANCH)" \
							crawlers
	docker push "d3estudio/tmj-crawlers:$(BRANCH)"

web:
	docker-compose run api rake assets:clean assets:precompile RAILS_ENV=production SITE_URL=''
	docker build -t "d3estudio/tmj-web:$(BRANCH)" \
							api
	docker push "d3estudio/tmj-web:$(BRANCH)"
