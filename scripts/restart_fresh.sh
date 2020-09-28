mongo_container_id=$(docker ps --filter "name=mongo_1" -q)

docker-compose stop
docker rm ${mongo_container_id}
docker-compose up -d

mongo_container_id=$(docker ps --filter "name=mongo_1" -q)
backend_container_id=$(docker ps --filter "name=backend_1" -q)

docker exec ${mongo_container_id} mongorestore -uroot -pexample /backup
docker logs ${backend_container_id} --tail=100 -f
