// prep for cicd
// pipeline {
//     agent {
//         kubernetes {
//             label 'docker-building-reportbuilding'
//             yamlFile 'CI/k8s.yml'
//         }
//     }
//     options {
//         timestamps ()
//         timeout(time: 10, unit: 'MINUTES')
//     }
//     stages {
//         stage('Setup Docker Image Build') {
//             steps {
//                 container('setup'){
//                     sh '''
//                         name=${GIT_URL#"https://bitbucket.microchip.com/scm/"} && \
//                         name="$(echo $name | tr '[:upper:]' '[:lower:]')" && \
//                         name=${name%".git"} && echo $name > docker.repoPath
//                     '''
//                     }
//                 }
//             }
//         stage('Automate Semantic Release') {
//             steps{
//                 container('semantic-release'){
//                  withCredentials([usernameColonPassword(credentialsId: 'TEST_SEMANTIC', variable: 'variable')]){
//                     sh """
//                        npx semantic-release --no-ci -r https://${variable}@bitbucket.microchip.com/scm/`cat docker.repoPath`".git"
//                        git fetch --tags
//                        git tag -l --sort=v:refname |tail -1 > docker.version
//                     """
//                         }
//                     }
//                 }
//             }
//         stage('Build/Deploy Docker Image') {
//             when { branch 'master'}
//             steps{
//                 container('kaniko'){
//                     sh '''
//                         /kaniko/executor --context `pwd` --destination=artifacts.microchip.com:7999/microchip/`cat docker.repoPath`:`cat docker.version`
//                     '''
//                 }
//             }
//         }
//     }
// }