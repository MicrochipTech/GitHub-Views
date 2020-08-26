# About

`buildDockerImage.sh` will get the git tag and build build the folders in the root level project, excluding `./.git` and `CI`.

Accetable arguments are:

|ARG|Explanation|
|---|:---|
|start|Will run `build` and `push` arguments|
|**debug**|Will run `docker image ls` and `docker ps -a`<br>This is the **default**, if there are no arguments|
|build|Will run `docker build`.<br>The folders used to build are from the `find ouput`.<br>The `docker image version` is the `git tag` <br>Each folder will be used as the `app_name` to be pushed back to artifactory 
|push|Will run `docker push` to push back the images from the `build` output

The script will be invalidated when CI/CD will be implemented.