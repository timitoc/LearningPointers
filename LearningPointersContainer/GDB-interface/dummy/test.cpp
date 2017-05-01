#include <cstdio>
using namespace std;
int main(){
    for(int i = 23; i <= 27;i++){
        printf("%d\n",i*i);
        if(i % 2){
            printf("-------%d--------\n",i);
        }
    }
}
