.PHONY: up down clean

up:
	docker compose up -d

down:
	docker compose down

clean:
	docker compose down --volumes --remove-orphans
	docker system prune -a --volumes -f
	rm -rf nginx/certs/
