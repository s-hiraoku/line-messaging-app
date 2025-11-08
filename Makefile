DC = docker compose

.PHONY: db-up db-down db-logs db-psql db-reset db-status

db-up:
	$(DC) up -d postgres

db-down:
	$(DC) down

db-logs:
	$(DC) logs -f postgres

db-psql:
	docker exec -it lineapp-postgres psql -U postgres -d line_app

db-reset:
	$(DC) down -v
	$(DC) up -d postgres

db-status:
	$(DC) ps

