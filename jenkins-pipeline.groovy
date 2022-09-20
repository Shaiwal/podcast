node('Rcdn-Node-27|| Rcdn-Node-29') {
git(
url: 'ssh://git@gitscm.cisco.com/it-cits-customerstrategyandsuccess-icxpocdeploy/icxpocproj1-container.git',
branch: env.BRANCH_NAME+""
)
def GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse HEAD').take(6)
stage("Docker build") {
sh "docker build -t containers.cisco.com/it_cits_csas/icxpocdeploy_icxpoc-proj1:Rev${GIT_COMMIT}-Bld$BUILD_ID-dev ."
}
/* stage("Docker login") {
sh "docker login -u jenkins-ci.gen -p 9xSxHpyUHUZfvj3KFFbrur4RVvKa/P4ClZdtpa0UktGcBaIJIdQ3gIG49h69ugiO containers.cisco.com"
}*/
stage("Docker push") {
sh "docker push containers.cisco.com/it_cits_csas/icxpocdeploy_icxpoc-proj1:Rev${GIT_COMMIT}-Bld$BUILD_ID-dev"
}
stage ('Static Security')
{staticSecurityScan sparkroomid: '5ba52ea5-c221-307b-a0eb-21b1b884f4ad', stackName: 'icxpoc-proj1-Container'
}
}
