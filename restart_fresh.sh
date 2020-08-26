docker-compose stop
docker rm github-statistics-collector_mongo_1
docker-compose up -d
docker exec github-statistics-collector_mongo_1 mongorestore -uroot -pexample /backup
docker logs github-statistics-collector_backend_1 --tail=100 -f
