docker-compose stop
docker rm github-views_mongo_1
docker-compose up -d
docker exec github-views_mongo_1 mongorestore -uroot -pexample /backup
docker logs github-views_backend_1 --tail=100 -f

# mongo_container_id=$(docker ps --filter "name=mongo_1" -q)
# 
# docker-compose stop
# docker rm ${mongo_container_id}
# docker-compose up -d
# 
# mongo_container_id=$(docker ps --filter "name=mongo_1" -q)
# backend_container_id=$(docker ps --filter "name=backend_1" -q)
# 
# docker exec ${mongo_container_id} mongorestore -uroot -pexample /backup
# docker logs ${backend_container_id} --tail=100 -f
